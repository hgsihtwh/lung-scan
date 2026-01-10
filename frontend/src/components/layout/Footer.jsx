const Footer = () => {
  return (
    <footer className="bg-primary-navy text-primary-beige mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] py-6 sm:py-8 md:py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          {/* Left side */}
          <div>
            <h3 className="font-outfit font-semibold text-2xl mb-2">CHEST SCAN</h3>
            <p className="font-outfit font-light text-[15px]">Research Project</p>
            <p className="font-outfit font-light text-[15px]">2025</p>
          </div>

          {/* Right side */}
          <div>
            <h4 className="font-outfit font-semibold text-[15px] mb-2">RESOURCES</h4>
            <a
              href="https://github.com/hgsihtwh/lung-scan"
              target="_blank"
              rel="noopener noreferrer"
              className="font-outfit font-normal text-[15px] hover:opacity-70 transition-opacity"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
