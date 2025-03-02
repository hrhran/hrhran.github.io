import { useState } from 'react'
import { FaGithub, FaLinkedin, FaInstagram, FaSteam, FaDiscord, FaFolder, FaFileAlt, FaArrowLeft } from 'react-icons/fa'

export default function Portfolio() {
  const [activeFolder, setActiveFolder] = useState(null);

  const experiences = [
    { company: "Tekion", role: "Associate Software Engineer", period: "2022-Present", description: "Working in React and Golang services" },
    { company: "tradewithMAK", role: "Full Stack Developer", period: "2022-2022", description: "Built dashboards and bots with MERN and python" },
    { company: "Zoho", role: "SDE Intern", period: "2021-2021", description: "Worked on JAVA and JSP Servlets" },
  ];

  const projects = [
    { name: "Surveyin", link: "https://github.com/hrhran/surveyin" },
    { name: "ChatGPT", link: "https://chat.com" },
    { name: "NASA", link: "https://nasa.gov" },
  ];

  const skills = ["Javascript", "React", "Node", "Python", "Go", "MongoDB", "MySQL", "Git", "Figma"];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <section className="h-screen w-screen flex flex-col items-center justify-center text-center relative">
        <h1 className="text-6xl font-bold text-green-400">HARIHARAN.S</h1>
        <p className="text-2xl text-blue-300">Full Stack Developer</p>
        <div className="flex space-x-4 mt-4">
          <a href="https://github.com/hrhran" target="_blank"><FaGithub size={26} className="text-green-400" /></a>
          <a href="https://www.linkedin.com/in/hrhran/" target="_blank"><FaLinkedin size={26} className="text-green-400" /></a>
          <a href="https://steamcommunity.com/id/hazewild" target="_blank"><FaSteam size={26} className="text-green-400" /></a>
          <a href="https://discord.com/users/302120394243047426" target="_blank"><FaDiscord size={26} className="text-green-400" /></a>
          <a href="https://www.instagram.com/hrhran/" target="_blank"><FaInstagram size={26} className="text-green-400" /></a>
        </div>
      </section>

      <section className="py-20 px-10 md:px-20">
        <h2 className="text-4xl font-bold mb-10 text-center">Work Experience</h2>
        <div className="relative border-l-2 border-green-400 pl-6 md:ml-[25%]">
          {experiences.map((exp, index) => (
            <div key={index} className="mb-8">
              <div className="absolute -left-3 w-6 h-6 bg-green-400 rounded-full"></div>
              <h3 className="text-2xl font-bold">{exp.company}</h3>
              <p className="text-blue-300">{exp.role} | {exp.period}</p>
              <p className="mt-2 text-green-200">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 md:px-20 flex justify-center">
        <div className="w-full max-w-4xl relative h-96 flex flex-col border-1 border-green-400">
          <div className="bg-gray-900 px-4 py-1 text-sm text-white rounded-t">
            /usr/hrhran/{activeFolder || ''}
          </div>
          <div className="flex p-4">
            {activeFolder ? (
              <div className="w-full p-4 overflow-y-auto">
                <button onClick={() => setActiveFolder(null)} className="flex items-center hover:text-blue-400 mb-4 ml-[-15px]">
                  <FaArrowLeft size={20} />
                </button>
                {activeFolder === 'projects' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {projects.map((project, index) => (
                      <a key={index} href={project.link} target="_blank" className="flex items-center space-x-2 hover:text-blue-400">
                        <FaFileAlt size={24} /> <span>{project.name}</span>
                      </a>
                    ))}
                  </div>
                )}
                {activeFolder === 'skills' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FaFileAlt size={24} /> <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-10">
                <button onClick={() => setActiveFolder('projects')} className="flex flex-col items-center space-y-2 hover:text-blue-400">
                  <FaFolder size={80} /> <span>Projects</span>
                </button>
                <button onClick={() => setActiveFolder('skills')} className="flex flex-col items-center space-y-2 hover:text-blue-400">
                  <FaFolder size={80} /> <span>Skills</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 md:px-20 text-center">
        <h2 className="text-4xl font-bold mb-10">Get in Touch</h2>
        <button onClick={() => window.location.href='mailto:hariharan0044@gmail.com'} className="bg-green-400 text-black px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">
          Email Me
        </button>
      </section>

      <footer className="py-6 text-center text-sm text-green-600">
        © 2025 Hariharan | Portfolio
      </footer>
    </div>
  )
}
