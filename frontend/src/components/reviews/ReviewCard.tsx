/**
 * ReviewCard Component - Phase 7
 * Display individual review with response option
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, Flag, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import {
  voteReviewHelpful,
  respondToReview,
  getReviewAgeText,
  type Review,
} from '@/services/reviewService'

interface ReviewCardProps {
  review: Review
  canRespond?: boolean
  onFlag?: (reviewId: string) => void
}

export function ReviewCard({
  review,
  canRespond = false,
  onFlag,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVoted, setIsVoted] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [showResponseInput, setShowResponseInput] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const [localResponse, setLocalResponse] = useState(review.response)

  const handleVoteHelpful = async () => {
    const { data } = await voteReviewHelpful(review.id)
    if (data?.success) {
      setIsVoted(data.voted)
      setHelpfulCount(data.helpful_count)
    }
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return

    setIsSubmittingResponse(true)
    const { data } = await respondToReview(review.id, responseText.trim())
    setIsSubmittingResponse(false)

    if (data?.success) {
      setLocalResponse({
        content: responseText.trim(),
        created_at: new Date().toISOString(),
      })
      setShowResponseInput(false)
      setResponseText('')
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`}
        />
      ))}
    </div>
  )

  const contentTooLong = review.content && review.content.length > 200

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {review.reviewer?.profile_image_url ? (
            <img
              src={review.reviewer.profile_image_url}
              alt={review.reviewer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
              {review.reviewer?.name?.charAt(0) || '?'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{review.reviewer?.name}</span>
            <span className="text-zinc-500 text-sm">•</span>
            <span className="text-zinc-500 text-sm">{getReviewAgeText(review.created_at)}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {renderStars(review.overall_rating)}
            {review.title && <span className="text-sm font-medium text-white truncate">{review.title}</span>}
          </div>
        </div>
      </div>

      {review.content && (
        <div className="mt-4">
          <p className={`text-zinc-300 text-sm leading-relaxed ${!isExpanded && contentTooLong ? 'line-clamp-3' : ''}`}>
            {review.content}
          </p>
          {contentTooLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-purple-400 text-sm mt-2 hover:text-purple-300"
            >
              {isExpanded ? <><ChevronUp className="w-4 h-4" />Weniger</> : <><ChevronDown className="w-4 h-4" />Mehr</>}
            </button>
          )}
        </div>
      )}

      {review.categories && review.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.categories.map((cat) => (
            <div key={cat.category} className="flex items-center gap-1.5 bg-zinc-800/50 rounded-full px-3 py-1">
              <span className="text-xs text-zinc-400 capitalize">{cat.category.replace(/_/g, ' ')}</span>
              <span className="text-xs font-medium text-yellow-400">{cat.rating}/5</span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {localResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-zinc-800/50 rounded-lg p-4 border-l-2 border-purple-500"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Antwort</span>
            </div>
            <p className="text-sm text-zinc-300">{localResponse.content}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleVoteHelpful}
            className={`flex items-center gap-1.5 text-sm transition-colors ${isVoted ? 'text-purple-400' : 'text-zinc-500 hover:text-purple-400'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${isVoted ? 'fill-current' : ''}`} />
            <span>Hilfreich ({helpfulCount})</span>
          </button>

          {onFlag && (
            <button onClick={() => onFlag(review.id)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400">
              <Flag className="w-4 h-4" /><span>Melden</span>
            </button>
          )}
        </div>

        {canRespond && !localResponse && !showResponseInput && (
          <button onClick={() => setShowResponseInput(true)} className="flex items-center gap-1.5 text-sm text-purple-400">
            <MessageSquare className="w-4 h-4" /><span>Antworten</span>
          </button>
        )}
      </div>

      {/* Response Input Form */}
      <AnimatePresence>
        {showResponseInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-zinc-800"
          >
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Deine Antwort..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-sm"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setShowResponseInput(false)
                  setResponseText('')
                }}
                className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim() || isSubmittingResponse}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg"
              >
                {isSubmittingResponse ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <MessageSquare className="w-3 h-3" />
                )}
                Antworten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ReviewCard
