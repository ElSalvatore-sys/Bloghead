function App() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="font-display text-3xl text-text-primary">BlogHead</h1>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-text-secondary hover:text-text-primary">ABOUT</a>
          <a href="#" className="text-text-secondary hover:text-text-primary">ARTISTS</a>
          <a href="#" className="text-text-secondary hover:text-text-primary">EVENTS</a>
          <button className="btn btn-primary">SIGN IN</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <p className="text-text-secondary mb-4 tracking-widest">BE A MEMBER OF</p>
        <h2 className="section-title text-6xl md:text-8xl mb-8">BlogHead</h2>
        <div className="brush-stroke w-64 mb-8"></div>
        <p className="text-text-secondary max-w-xl">
          The platform connecting artists with customers. DJs, singers, performers - find your next gig or book your favorite artist.
        </p>
      </section>

      {/* Design System Preview */}
      <section className="px-8 py-16 max-w-6xl mx-auto">
        <h3 className="section-title text-4xl mb-8">Design System</h3>

        {/* Colors */}
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-4 text-text-primary">Colors</h4>
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-bg-primary border border-white/20"></div>
              <span className="text-sm text-text-muted mt-2">#171717</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-bg-card"></div>
              <span className="text-sm text-text-muted mt-2">#232323</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-accent-purple"></div>
              <span className="text-sm text-text-muted mt-2">#610AD1</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-accent-red"></div>
              <span className="text-sm text-text-muted mt-2">#F92B02</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg bg-accent-salmon"></div>
              <span className="text-sm text-text-muted mt-2">#FB7A43</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-lg gradient-bloghead"></div>
              <span className="text-sm text-text-muted mt-2">Gradient</span>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-4 text-text-primary">Typography</h4>
          <div className="space-y-4">
            <p className="font-display text-5xl">Hyperwave One - Display Font</p>
            <p className="font-sans text-2xl font-bold">Roboto Bold - Headlines</p>
            <p className="font-sans text-lg">Roboto Regular - Body copy for descriptions and content</p>
            <p className="font-sans text-sm text-text-secondary">Roboto - Secondary text style</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-4 text-text-primary">Buttons</h4>
          <div className="flex gap-4 flex-wrap">
            <button className="btn btn-primary">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-4 text-text-primary">Cards</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="w-full h-32 bg-bg-card-hover rounded-lg mb-4"></div>
              <h5 className="font-bold text-lg mb-2">Artist Name</h5>
              <p className="text-text-secondary text-sm mb-2">DJ, Singer, Performer</p>
              <p className="text-text-muted text-sm">Berlin, Germany</p>
              <div className="flex items-center gap-1 mt-3">
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-empty">&#9733;</span>
              </div>
              <button className="btn btn-primary mt-4 w-full">PROFIL ANSEHEN</button>
            </div>
            <div className="card">
              <div className="w-full h-32 bg-bg-card-hover rounded-lg mb-4"></div>
              <h5 className="font-bold text-lg mb-2">Another Artist</h5>
              <p className="text-text-secondary text-sm mb-2">Producer, Songwriter</p>
              <p className="text-text-muted text-sm">Munich, Germany</p>
              <div className="flex items-center gap-1 mt-3">
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
              </div>
              <button className="btn btn-primary mt-4 w-full">PROFIL ANSEHEN</button>
            </div>
            <div className="card">
              <div className="w-full h-32 bg-bg-card-hover rounded-lg mb-4"></div>
              <h5 className="font-bold text-lg mb-2">Third Artist</h5>
              <p className="text-text-secondary text-sm mb-2">Band, Live Performance</p>
              <p className="text-text-muted text-sm">Hamburg, Germany</p>
              <div className="flex items-center gap-1 mt-3">
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-filled">&#9733;</span>
                <span className="star-empty">&#9733;</span>
                <span className="star-empty">&#9733;</span>
              </div>
              <button className="btn btn-primary mt-4 w-full">PROFIL ANSEHEN</button>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-4 text-text-primary">Form Elements</h4>
          <div className="max-w-md space-y-4">
            <input type="text" className="input" placeholder="Email or Username" />
            <input type="password" className="input" placeholder="Password" />
            <button className="btn btn-primary w-full">Login</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 text-center">
        <div className="brush-stroke w-full max-w-4xl mx-auto mb-8"></div>
        <div className="flex justify-center gap-8 text-text-secondary">
          <a href="#">Impressum</a>
          <a href="#">Kontakt</a>
          <a href="#">Datenschutz</a>
        </div>
      </footer>
    </div>
  )
}

export default App
