import { useState, useEffect } from 'react'

export default function MailPage() {
  const [loading, setLoading] = useState(true)
  const [selectedMail, setSelectedMail] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composing, setComposing] = useState(false)

  // Fake loader - 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Get game stats from localStorage
  const getGameStats = () => {
    const game1Attempts = localStorage.getItem('game1_attempts') || 0
    const game2Attempts = localStorage.getItem('game2_attempts') || 0

    return {
      game1Attempts,
      game2Attempts,
    }
  }

  const stats = getGameStats()

  const emails = [
    {
      id: 1,
      from: 'CRS Management',
      subject: 'You have been selected.',
      preview: 'Congratulations! Your performance has been exceptional...',
      time: '2:30 PM',
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #202124;">
          <h2 style="color: #1a73e8;">Congratulations!</h2>
          <p style="color: #202124;">Dear Candidate,</p>
          <p style="color: #202124;">We are pleased to inform you that you have been selected based on your exceptional performance in our assessment games.</p>

          <h3 style="color: #333; margin-top: 30px;">Your Performance Statistics:</h3>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1a73e8; margin-top: 0;">Game 1: Catch the Clients</h4>
            <p style="color: #202124;"><strong>Attempts:</strong> ${stats.game1Attempts}</p>
          </div>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1a73e8; margin-top: 0;">Game 2: Rhythm Challenge</h4>
            <p style="color: #202124;"><strong>Attempts:</strong> ${stats.game2Attempts}</p>
          </div>

          <p style="margin-top: 30px; color: #202124;">Your dedication and skill have not gone unnoticed. We look forward to your continued excellence.</p>

          <p style="margin-top: 20px; color: #202124;">Best regards,<br/>
          <strong>CRS Management Team</strong><br/>
          Consumer Recreational Services</p>
        </div>
      `,
    },
    {
      id: 2,
      from: 'UPS Delivery',
      subject: 'Amazon Order Delivered',
      preview: 'Your package has been delivered to your doorstep...',
      time: '11:45 AM',
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #202124;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #FF9900; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
              <h1 style="margin: 0; font-size: 36px; color: white;">UPS</h1>
            </div>
          </div>

          <h2 style="color: #333;">Delivery Confirmation</h2>
          <p style="color: #202124;">Your Amazon package has been successfully delivered!</p>

          <div style="background: #f9f9f9; border-left: 4px solid #FF9900; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Package Details</h3>
            <p style="color: #202124;"><strong>Item:</strong> English Dictionary (Hardcover Edition)</p>
            <p style="color: #202124;"><strong>Delivered:</strong> Today at 11:42 AM</p>
            <p style="color: #202124;"><strong>Location:</strong> Front Porch</p>
            <p style="color: #202124;"><strong>Tracking Number:</strong> 1Z999AA10123456784</p>
          </div>

          <p style="color: #202124;">Your comprehensive English Dictionary has been delivered in perfect condition. This premium hardcover edition features:</p>
          <ul style="color: #202124;">
            <li>Over 500,000 words and definitions</li>
            <li>Etymology and usage examples</li>
            <li>Premium leather-bound cover</li>
            <li>Gold-edged pages</li>
          </ul>

          <p style="margin-top: 30px; color: #666;">Happy reading! May this dictionary serve you well in all your linguistic endeavors.</p>

          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated message from UPS. Please do not reply to this email.
          </p>
        </div>
      `,
    },
    {
      id: 3,
      from: 'Unknown Sender',
      subject: 'Whos this diva ???',
      preview: 'Check out this amazing photo...',
      time: '9:15 AM',
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; color: #202124;">
          <h2 style="color: #333;">Whos this diva ???</h2>
          <p style="color: #666; margin-bottom: 30px;">Someone sent you this mysterious photo...</p>

          <img
            style="width: 50%;height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);text-align: center;"
            src="https://i.ibb.co/S4v0RYx8/final.png"
            alt="Mystery Diva"
            style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
          />

          <p style="margin-top: 30px; color: #393939; font-style: italic;">
            End of the line.
          </p>
        </div>
      `,
    },
  ]

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        {/* Gmail-like logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <svg width="75" height="57" viewBox="0 0 75 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5 28.5L0 0V57H75V0L37.5 28.5Z" fill="#EA4335"/>
              <path d="M0 0L37.5 28.5L75 0H0Z" fill="#FBBC04"/>
              <path d="M0 0V57L37.5 28.5L0 0Z" fill="#34A853"/>
              <path d="M75 0V57L37.5 28.5L75 0Z" fill="#4285F4"/>
            </svg>
          </div>
        </div>

        {/* Loader */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white overflow-hidden">
      {/* Gmail Header */}
      <header className="flex items-center px-4 py-2 border-b border-gray-200 bg-white h-16 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1">
          {/* Menu Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 4h16M2 10h16M2 16h16" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Gmail Logo */}
          <div className="flex items-center gap-2">
            <svg width="40" height="30" viewBox="0 0 75 57" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5 28.5L0 0V57H75V0L37.5 28.5Z" fill="#EA4335"/>
              <path d="M0 0L37.5 28.5L75 0H0Z" fill="#FBBC04"/>
              <path d="M0 0V57L37.5 28.5L0 0Z" fill="#34A853"/>
              <path d="M75 0V57L37.5 28.5L75 0Z" fill="#4285F4"/>
            </svg>
            <span className="text-xl text-gray-700">Gmail</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#5f6368" strokeWidth="2"/>
              <path d="M12 12l6 6" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search mail"
              className="bg-transparent border-none outline-none ml-3 flex-1 text-sm"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#5f6368" strokeWidth="2"/>
              <path d="M10 6v4l3 3" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#5f6368"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white overflow-y-auto">
          <div className="p-2">
            {/* Compose Button */}
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-4 px-6 py-4 bg-blue-50 hover:bg-blue-100 rounded-2xl shadow-md hover:shadow-lg transition mb-4"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 8v16M8 16h16" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: '#5f5f5f' }}>Compose</span>
            </button>

            {/* Navigation */}
            <nav className="space-y-1">
              <div className="flex items-center gap-4 px-4 py-2 bg-red-50 text-gray-900 rounded-r-full cursor-pointer font-medium">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 4l8 6 8-6v12H2V4z" fill="#EA4335"/>
                </svg>
                <span className="text-sm">Inbox</span>
                <span className="ml-auto text-sm font-bold">3</span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 rounded-r-full cursor-pointer text-gray-700">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" stroke="#5f6368" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm">Starred</span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 rounded-r-full cursor-pointer text-gray-700">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 4h16v12H2z" stroke="#5f6368" strokeWidth="1.5"/>
                  <path d="M2 4l8 6 8-6" stroke="#5f6368" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm">Sent</span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 rounded-r-full cursor-pointer text-gray-700">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4h12v12H4z" stroke="#5f6368" strokeWidth="1.5"/>
                  <path d="M4 8h12" stroke="#5f6368" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm">Drafts</span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 rounded-r-full cursor-pointer text-gray-700">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#5f6368" strokeWidth="1.5"/>
                  <path d="M10 6v8M6 10h8" stroke="#5f6368" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm">Spam</span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 rounded-r-full cursor-pointer text-gray-700">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4h8M8 4V2h4v2M4 4h12v2H4z" stroke="#5f6368" strokeWidth="1.5"/>
                  <path d="M5 6h10v10H5z" stroke="#5f6368" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm">Trash</span>
              </div>
            </nav>
          </div>
        </aside>

        {/* Email List / Detail View */}
        <main className="flex-1 bg-white overflow-hidden flex flex-col border-l border-gray-200">
          {!selectedMail ? (
            /* Email List */
            <div className="flex-1 overflow-y-auto">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="#5f6368" strokeWidth="1.5"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M10 4v12" stroke="#5f6368" strokeWidth="1.5"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16 10a6 6 0 11-12 0 6 6 0 0112 0z" stroke="#5f6368" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>

              {/* Email Items */}
              <div className="divide-y divide-gray-200">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedMail(email)}
                    className="flex items-center gap-4 px-6 py-3 hover:shadow-md cursor-pointer transition border-l-4 border-transparent hover:border-l-blue-500 bg-white hover:bg-gray-50"
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="3" width="14" height="14" rx="2" stroke="#5f6368" strokeWidth="1.5"/>
                      </svg>
                    </div>

                    {/* Star */}
                    <div className="flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" stroke="#5f6368" strokeWidth="1.5"/>
                      </svg>
                    </div>

                    {/* Email Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <span className="font-semibold text-sm text-gray-900 flex-shrink-0">{email.from}</span>
                        <span className="font-medium text-sm text-gray-900 truncate">{email.subject}</span>
                        <span className="text-sm text-gray-600 truncate">- {email.preview}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 text-xs text-gray-600">
                      {email.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Email Detail View */
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button
                  onClick={() => setSelectedMail(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Back to inbox"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12 4l-8 6 8 6" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 4h12v12H4z" stroke="#5f6368" strokeWidth="1.5"/>
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 4h8M8 4V2h4v2M4 4h12v2H4z" stroke="#5f6368" strokeWidth="1.5"/>
                    <path d="M5 6h10v10H5z" stroke="#5f6368" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>

              {/* Email Content */}
              <div className="flex-1 px-8 py-6">
                {/* Subject */}
                <h1 className="text-2xl font-normal text-gray-900 mb-6">{selectedMail.subject}</h1>

                {/* Sender Info */}
                <div className="flex items-start gap-3 mb-8 pb-6 border-b border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {selectedMail.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{selectedMail.from}</div>
                        <div className="text-xs text-gray-600">to me</div>
                      </div>
                      <div className="text-xs text-gray-600">{selectedMail.time}</div>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedMail.body }}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-sm font-medium text-gray-900">New Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Compose Form */}
            <form
              action="https://formspree.io/f/xvzzgnvw"
              method="POST"
              className="flex-1 flex flex-col overflow-hidden"
              onSubmit={() => setComposing(true)}
            >
              {/* To Field */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center">
                <label className="text-sm text-gray-600 w-16">To:</label>
                <input
                  type="text"
                  value="hrhran"
                  disabled
                  className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900"
                />
              </div>

              {/* Subject Field */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center">
                <label className="text-sm text-gray-600 w-16">Subject:</label>
                <input
                  type="text"
                  name="subject"
                  value="Experience Feedback"
                  disabled
                  className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900"
                />
              </div>

              {/* Message Field */}
              <div className="flex-1 px-4 py-3 overflow-y-auto">
                <textarea
                  name="message"
                  placeholder="Type your feedback here..."
                  required
                  className="w-full h-full text-sm border-none outline-none resize-none text-gray-900"
                  style={{ minHeight: '200px' }}
                />
              </div>

              {/* Hidden Stats Fields */}
              <input type="hidden" name="subject" value="Experience Feedback" />
              <input type="hidden" name="game1_attempts" value={stats.game1Attempts} />
              <input type="hidden" name="game2_attempts" value={stats.game2Attempts} />
              <input
                type="hidden"
                name="stats_summary"
                value={`Game 1 Attempts: ${stats.game1Attempts} | Game 2 Attempts: ${stats.game2Attempts}`}
              />

              {/* Footer with Send Button */}
              <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={composing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {composing ? 'Sending...' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

