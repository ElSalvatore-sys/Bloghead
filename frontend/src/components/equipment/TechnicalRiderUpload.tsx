// ============================================
// TECHNICAL RIDER UPLOAD
// Upload and manage PDF riders & stage plots
// ============================================

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image,
  X,
  Download,
  Star,
  Trash2,
  Eye
} from 'lucide-react';
import type { TechnicalRider } from '@/types/equipment';
import { RIDER_TYPE_LABELS } from '@/types/equipment';

interface TechnicalRiderUploadProps {
  riders: TechnicalRider[];
  onUploadRider: (file: File) => Promise<string>;
  onUploadStagePlot: (file: File) => Promise<string>;
  onCreateRider: (data: { name: string; file_url: string; rider_type: 'uploaded' }) => Promise<void>;
  onUpdateRider: (id: string, data: { is_primary?: boolean }) => Promise<void>;
  onDeleteRider: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function TechnicalRiderUpload({
  riders,
  onUploadRider,
  onUploadStagePlot,
  onCreateRider,
  onUpdateRider,
  onDeleteRider,
  isLoading = false,
}: TechnicalRiderUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'rider' | 'stageplot' | null>(null);
  const riderInputRef = useRef<HTMLInputElement>(null);
  const stagePlotInputRef = useRef<HTMLInputElement>(null);

  const handleRiderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadType('rider');

    try {
      const url = await onUploadRider(file);
      await onCreateRider({
        name: file.name.replace('.pdf', ''),
        file_url: url,
        rider_type: 'uploaded',
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadType(null);
      if (riderInputRef.current) {
        riderInputRef.current.value = '';
      }
    }
  };

  const handleStagePlotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadType('stageplot');

    try {
      const url = await onUploadStagePlot(file);
      // Stage plot is typically added to an existing rider
      // For now, create a new rider with just the stage plot
      await onCreateRider({
        name: 'Stage Plot',
        file_url: url,
        rider_type: 'uploaded',
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadType(null);
      if (stagePlotInputRef.current) {
        stagePlotInputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = async (riderId: string) => {
    try {
      await onUpdateRider(riderId, { is_primary: true });
    } catch (error) {
      console.error('Failed to set primary:', error);
    }
  };

  const handleDelete = async (riderId: string) => {
    if (!confirm('Rider wirklich löschen?')) return;

    try {
      await onDeleteRider(riderId);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rider Upload */}
        <div>
          <input
            ref={riderInputRef}
            type="file"
            accept=".pdf"
            onChange={handleRiderUpload}
            className="hidden"
            id="rider-upload"
          />
          <label
            htmlFor="rider-upload"
            className={`
              flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
              ${isUploading && uploadType === 'rider'
                ? 'border-accent-purple bg-accent-purple/10'
                : 'border-white/10 hover:border-accent-purple/50 hover:bg-white/5'
              }
            `}
          >
            {isUploading && uploadType === 'rider' ? (
              <>
                <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin mb-2" />
                <span className="text-sm text-accent-purple">Wird hochgeladen...</span>
              </>
            ) : (
              <>
                <FileText className="w-8 h-8 text-accent-purple mb-2" />
                <span className="font-medium text-text-primary">Technical Rider</span>
                <span className="text-sm text-text-muted">PDF hochladen</span>
              </>
            )}
          </label>
        </div>

        {/* Stage Plot Upload */}
        <div>
          <input
            ref={stagePlotInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleStagePlotUpload}
            className="hidden"
            id="stageplot-upload"
          />
          <label
            htmlFor="stageplot-upload"
            className={`
              flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
              ${isUploading && uploadType === 'stageplot'
                ? 'border-accent-purple bg-accent-purple/10'
                : 'border-white/10 hover:border-accent-purple/50 hover:bg-white/5'
              }
            `}
          >
            {isUploading && uploadType === 'stageplot' ? (
              <>
                <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin mb-2" />
                <span className="text-sm text-accent-purple">Wird hochgeladen...</span>
              </>
            ) : (
              <>
                <Image className="w-8 h-8 text-accent-purple mb-2" />
                <span className="font-medium text-text-primary">Stage Plot</span>
                <span className="text-sm text-text-muted">PDF oder Bild</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Riders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-xl h-20" />
          ))}
        </div>
      ) : riders.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Noch keine Rider hochgeladen</p>
          <p className="text-sm">
            Laden Sie Ihren Technical Rider und Stage Plot hoch
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className={`
                bg-bg-card border rounded-xl p-4 flex items-center gap-4
                ${rider.is_primary ? 'border-accent-purple' : 'border-white/5'}
              `}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-bg-secondary rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent-purple" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-text-primary truncate">
                    {rider.name}
                  </h4>
                  {rider.is_primary && (
                    <span className="px-2 py-0.5 bg-accent-purple/20 text-accent-purple text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Primär
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span>{RIDER_TYPE_LABELS[rider.rider_type]}</span>
                  <span>•</span>
                  <span>v{rider.version}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {rider.file_url && (
                  <>
                    <a
                      href={rider.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Ansehen"
                    >
                      <Eye className="w-4 h-4 text-text-muted" />
                    </a>
                    <a
                      href={rider.file_url}
                      download
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Herunterladen"
                    >
                      <Download className="w-4 h-4 text-text-muted" />
                    </a>
                  </>
                )}
                {!rider.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(rider.id)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Als primär setzen"
                  >
                    <Star className="w-4 h-4 text-text-muted" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rider.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TechnicalRiderUpload;
