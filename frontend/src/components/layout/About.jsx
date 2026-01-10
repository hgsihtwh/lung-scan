import { useState } from 'react'

const About = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  const workflowSteps = [
    { number: '01', label: 'Upload DICOM Archive' },
    { number: '02', label: 'Review CT slices' },
    { number: '03', label: 'Run AI analysis' },
    { number: '04', label: 'View Results' },
    { number: '05', label: 'Download detailed report' },
  ]

  return (
    <section
      id="about"
      className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] py-16 sm:py-20 md:py-24 scroll-mt-24"
    >
      <div className="flex justify-between items-center mb-12 sm:mb-16 lg:mb-[120px]">
        <h2
          className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px]"
          style={{ color: '#302F2C' }}
        >
          ABOUT CHEST SCAN
        </h2>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-outfit font-normal text-base sm:text-lg lg:text-[20px] hover:opacity-70 transition-opacity"
          style={{ color: '#302F2C' }}
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12 mb-16 sm:mb-20 lg:mb-28">
            {/* Model Performance Card */}
            <div className="border rounded-2xl p-6 sm:p-8" style={{ borderColor: '#302F2C' }}>
              <h3
                className="font-outfit font-medium text-lg sm:text-[20px] mb-6 sm:mb-8 lg:mb-10"
                style={{ color: '#302F2C' }}
              >
                MODEL PERFORMANCE
              </h3>

              <div className="grid grid-cols-2 gap-y-6 sm:gap-y-8">
                <div>
                  <p
                    className="font-outfit font-normal text-sm sm:text-[15px] mb-1"
                    style={{ color: '#302F2C', opacity: 0.6 }}
                  >
                    TRAINING SET
                  </p>
                  <p className="font-outfit font-semibold text-2xl" style={{ color: '#302F2C' }}>
                    1921
                  </p>
                </div>
                <div>
                  <p
                    className="font-outfit font-normal text-sm sm:text-[15px] mb-1"
                    style={{ color: '#302F2C', opacity: 0.6 }}
                  >
                    VALIDATION
                  </p>
                  <p className="font-outfit font-semibold text-2xl" style={{ color: '#302F2C' }}>
                    236
                  </p>
                </div>
                <div>
                  <p
                    className="font-outfit font-normal text-sm sm:text-[15px] mb-1"
                    style={{ color: '#302F2C', opacity: 0.6 }}
                  >
                    ACCURACY
                  </p>
                  <p className="font-outfit font-semibold text-2xl" style={{ color: '#233970' }}>
                    89,83%
                  </p>
                </div>
                <div>
                  <p
                    className="font-outfit font-normal text-sm sm:text-[15px] mb-1"
                    style={{ color: '#302F2C', opacity: 0.6 }}
                  >
                    ROC-AUC
                  </p>
                  <p className="font-outfit font-semibold text-2xl" style={{ color: '#233970' }}>
                    0,962
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p
                className="font-outfit font-normal text-base sm:text-lg lg:text-[20px] leading-relaxed mb-6"
                style={{ color: '#302F2C' }}
              >
                Chest Scan is a service designed to automatically identify truly normal chest CT
                scans - studies with no signs of any pathology. Unlike traditional AI solutions that
                detect specific diseases, Chest Scan defines the 'Normal' class, helping
                radiologists prioritize abnormal cases.
              </p>
              <p
                className="font-outfit font-normal text-base sm:text-lg lg:text-[20px] leading-relaxed"
                style={{ color: '#302F2C' }}
              >
                Our deep learning model has been trained on thousands of chest CT scans, achieving
                high accuracy in distinguishing between normal anatomy and pathological findings.
              </p>
            </div>
          </div>

          {/* User Workflow */}
          <div>
            <h3
              className="font-outfit font-semibold text-2xl sm:text-[30px] mb-12 sm:mb-14 lg:mb-16"
              style={{ color: '#302F2C' }}
            >
              USER WORKFLOW
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-4">
              {workflowSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="h-[60px] sm:h-[70px] lg:h-[80px] overflow-hidden mb-3">
                    <div
                      className="font-outfit font-thin text-[100px] sm:text-[110px] lg:text-[120px] leading-none select-none"
                      style={{
                        color: 'transparent',
                        WebkitTextStroke: '1.5px #233970',
                      }}
                    >
                      {step.number}
                    </div>
                  </div>
                  <p
                    className="font-outfit font-normal text-base sm:text-lg lg:text-[20px]"
                    style={{ color: '#302F2C' }}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default About
