import { useState } from 'react'
import {
  Button,
  Input,
  Card,
  ArtistCard,
  Badge,
  GenreBadge,
  StatusBadge,
  Modal,
  StarRating,
  GradientBrush,
  SectionDivider,
} from '../components/ui'
import { Header, Footer } from '../components/layout'
import {
  HeartIcon,
  HeartFilledIcon,
  StarIcon,
  StarFilledIcon,
  CalendarIcon,
  UserIcon,
  InstagramIcon,
  FacebookIcon,
  AudioIcon,
  CommunityIcon,
  UploadIcon,
  DownloadIcon,
  EditIcon,
  CameraIcon,
  PlayIcon,
  NextIcon,
  CoinIcon,
  LinkIcon,
  PlusIcon,
} from '../components/icons'

export function ComponentsPreview() {
  const [showModal, setShowModal] = useState(false)
  const [rating, setRating] = useState(3)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hip-Hop'])

  const genres = ['Hip-Hop', 'R&B', 'Electronic', 'Pop', 'Rock', 'Jazz']

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="font-display text-5xl text-text-primary mb-2">Component Library</h1>
        <p className="text-text-secondary mb-12">Bloghead Design System Components</p>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button disabled>Disabled</Button>
            <Button fullWidth className="max-w-xs">Full Width</Button>
          </div>
        </section>

        <SectionDivider />

        {/* Inputs Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Inputs</h2>
          <div className="max-w-md space-y-4">
            <Input placeholder="Default input" />
            <Input label="With Label" placeholder="Enter your email" />
            <Input label="With Error" error="This field is required" placeholder="Invalid input" />
            <Input label="With Helper" helperText="We'll never share your email" placeholder="helper@example.com" />
            <Input type="password" label="Password" placeholder="Enter password" />
            <Input disabled label="Disabled" placeholder="Can't edit this" />
          </div>
        </section>

        <SectionDivider />

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Cards</h2>

          <h3 className="text-lg font-medium text-text-secondary mb-4">Base Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <h4 className="font-bold text-lg mb-2">Default Card</h4>
              <p className="text-text-secondary text-sm">Basic card with padding</p>
            </Card>
            <Card variant="elevated">
              <h4 className="font-bold text-lg mb-2">Elevated Card</h4>
              <p className="text-text-secondary text-sm">Card with shadow</p>
            </Card>
            <Card variant="outlined" hoverable>
              <h4 className="font-bold text-lg mb-2">Hoverable Card</h4>
              <p className="text-text-secondary text-sm">Hover me!</p>
            </Card>
          </div>

          <h3 className="text-lg font-medium text-text-secondary mb-4">Artist Cards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ArtistCard
              name="Shannon Cuomo"
              category="DJ, Singer, Performer"
              location="Berlin, Germany"
              rating={4}
              price="200€"
              onViewProfile={() => alert('View profile')}
              onFavorite={() => alert('Toggle favorite')}
            />
            <ArtistCard
              name="Max Mustermann"
              category="Producer, Songwriter"
              location="Munich, Germany"
              rating={5}
              price="150€"
              isFavorite={true}
            />
            <ArtistCard
              name="Lisa Schmidt"
              category="Band, Live Performance"
              location="Hamburg, Germany"
              rating={3}
              price="500€"
            />
          </div>
        </section>

        <SectionDivider />

        {/* Badges Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Badges</h2>

          <h3 className="text-lg font-medium text-text-secondary mb-4">Basic Badges</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>

          <h3 className="text-lg font-medium text-text-secondary mb-4">Status Badges</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <StatusBadge status="pending" />
            <StatusBadge status="confirmed" />
            <StatusBadge status="cancelled" />
            <StatusBadge status="completed" />
          </div>

          <h3 className="text-lg font-medium text-text-secondary mb-4">Genre Badges</h3>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <GenreBadge
                key={genre}
                genre={genre}
                selected={selectedGenres.includes(genre)}
                onClick={() => toggleGenre(genre)}
              />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Star Rating Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Star Rating</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-text-secondary w-32">Small:</span>
              <StarRating rating={4} size="sm" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-secondary w-32">Medium:</span>
              <StarRating rating={3} size="md" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-secondary w-32">Large:</span>
              <StarRating rating={5} size="lg" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-secondary w-32">Interactive:</span>
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
              <span className="text-text-muted">({rating}/5)</span>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Gradient Elements Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Gradient Elements</h2>
          <div className="space-y-6">
            <div>
              <p className="text-text-secondary mb-2">Small:</p>
              <GradientBrush size="sm" />
            </div>
            <div>
              <p className="text-text-secondary mb-2">Medium:</p>
              <GradientBrush size="md" />
            </div>
            <div>
              <p className="text-text-secondary mb-2">Large:</p>
              <GradientBrush size="lg" />
            </div>
            <div>
              <p className="text-text-secondary mb-2">Custom width:</p>
              <GradientBrush className="w-64" />
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Modal Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Modal</h2>
          <Button onClick={() => setShowModal(true)}>Open Modal</Button>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Example Modal">
            <p className="text-text-secondary mb-4">
              This is an example modal with the Bloghead styling.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={() => setShowModal(false)}>Confirm</Button>
            </div>
          </Modal>
        </section>

        <SectionDivider />

        {/* Icons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Icons</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
            {[
              { icon: <HeartIcon />, name: 'Heart' },
              { icon: <HeartFilledIcon className="text-accent-purple" />, name: 'Heart Filled' },
              { icon: <StarIcon />, name: 'Star' },
              { icon: <StarFilledIcon className="text-accent-salmon" />, name: 'Star Filled' },
              { icon: <CalendarIcon />, name: 'Calendar' },
              { icon: <UserIcon />, name: 'User' },
              { icon: <InstagramIcon />, name: 'Instagram' },
              { icon: <FacebookIcon />, name: 'Facebook' },
              { icon: <AudioIcon />, name: 'Audio' },
              { icon: <CommunityIcon />, name: 'Community' },
              { icon: <UploadIcon />, name: 'Upload' },
              { icon: <DownloadIcon />, name: 'Download' },
              { icon: <EditIcon />, name: 'Edit' },
              { icon: <CameraIcon />, name: 'Camera' },
              { icon: <PlayIcon />, name: 'Play' },
              { icon: <NextIcon />, name: 'Next' },
              { icon: <CoinIcon />, name: 'Coin' },
              { icon: <LinkIcon />, name: 'Link' },
              { icon: <PlusIcon />, name: 'Plus' },
            ].map(({ icon, name }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center bg-bg-card rounded-lg text-text-primary">
                  {icon}
                </div>
                <span className="text-xs text-text-muted text-center">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Colors Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-full h-20 bg-bg-primary border border-white/20 rounded-lg mb-2"></div>
              <p className="text-sm text-text-muted">bg-primary</p>
              <p className="text-xs text-text-muted">#171717</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-bg-card rounded-lg mb-2"></div>
              <p className="text-sm text-text-muted">bg-card</p>
              <p className="text-xs text-text-muted">#232323</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-accent-purple rounded-lg mb-2"></div>
              <p className="text-sm text-text-muted">accent-purple</p>
              <p className="text-xs text-text-muted">#610AD1</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-accent-red rounded-lg mb-2"></div>
              <p className="text-sm text-text-muted">accent-red</p>
              <p className="text-xs text-text-muted">#F92B02</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-accent-salmon rounded-lg mb-2"></div>
              <p className="text-sm text-text-muted">accent-salmon</p>
              <p className="text-xs text-text-muted">#FB7A43</p>
            </div>
            <div className="text-center">
              <div className="w-full h-20 bg-gradient-to-r from-accent-purple via-accent-red to-accent-salmon rounded-lg mb-2"></div>
              <p className="text-sm text-text-muted">gradient</p>
              <p className="text-xs text-text-muted">brand</p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Typography</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Display (Hyperwave One)</p>
              <p className="font-display text-5xl">ARTISTS</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Heading (Roboto Bold)</p>
              <p className="text-3xl font-bold">Welcome to BlogHead</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Body (Roboto Regular)</p>
              <p className="text-base">The platform connecting artists with customers. DJs, singers, performers - find your next gig or book your favorite artist.</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Secondary</p>
              <p className="text-text-secondary">This is secondary text style</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Muted</p>
              <p className="text-text-muted">This is muted text style</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ComponentsPreview
