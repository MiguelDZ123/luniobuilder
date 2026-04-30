"use client";

import { useMemo, useState } from 'react';
import { BookOpen, CircleDot, FileText, Rocket, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';

const TOPICS = [
  {
    id: 'overview',
    title: 'Overview',
    icon: <BookOpen size={18} />, 
    intro: 'Get familiar with Luniobuilder, the main concepts, and how the application is organized.',
    sections: [
      {
        title: 'What is Luniobuilder?',
        paragraphs: [
          'Luniobuilder is a web-based application for designing, previewing, and managing visual website projects. It combines a drag-and-drop builder with project and account management features so you can build websites faster.',
        ],
        list: [
            'Intuitive builder interface for designing pages visually.',
            'Project management tools to organize your work and settings.',
            'Authentication and user sessions for secure access.',
            'Publishing workflow to deploy your site updates.',
        ],
      },
      {
        title: 'How the documentation is organized',
        paragraphs: [
          'Use the left navigation to browse topics. Each section contains clear guidance on how to use the builder, work with your projects, and manage settings.',
        ],
      },
    ],
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Rocket size={18} />,
    intro: 'Quickstart guidance for signing in, creating a project, and launching your first builder session.',
    sections: [
      {
        title: 'Sign in and access',
        paragraphs: [
          'Sign in with your account to access the dashboard and all builder features. The authentication flow is handled through the sign-in page and linked to your user profile.',
        ],
      },
      {
        title: 'Create a new project',
        paragraphs: [
          'From the dashboard, choose "Create Project" or select an existing one. Projects contain your pages, settings, and published builder state.',
          'Once a project is created, open it to load the builder interface and start editing your site.',
        ],
      },
    ],
  },
  {
    id: 'builder-ui',
    title: 'Builder UI',
    icon: <SlidersHorizontal size={18} />, 
    intro: 'Learn the main builder panels and how to add content, pages, and styles using the canvas interface.',
    sections: [
      {
        title: 'Left and right panels',
        paragraphs: [
          'The left panel helps you add new elements, manage layers, and navigate pages. The right panel is used for editing styles, content, and page settings.',
        ],
      },
      {
        title: 'Canvas interaction',
        paragraphs: [
          'Drag elements from the left panel onto the canvas, or double-click to insert them quickly. Use the selected element controls to update properties in the right panel.',
        ],
      },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: <FileText size={18} />, 
    intro: 'Manage your website projects, open existing work, and organize pages across your workspace.',
    sections: [
      {
        title: 'Project list',
        paragraphs: [
          'The dashboard shows all available projects. Select a project to open its editor or review its details.',
        ],
      },
      {
        title: 'Project settings',
        paragraphs: [
          'Use project settings to update metadata, team access, or publishing details. Settings are available inside each project view.',
        ],
      },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    icon: <ShieldCheck size={18} />, 
    intro: 'Understand how sign-in and user sessions work in the application.',
    sections: [
      {
        title: 'Sign-in flow',
        paragraphs: [
          'Authentication is powered by the app auth system. Users can sign in securely and maintain a session while editing builder projects.',
        ],
      },
      {
        title: 'Session management',
        paragraphs: [
          'If your session expires, you will be redirected to sign in again. Keep your browser session active while editing to avoid losing unsaved changes.',
        ],
      },
    ],
  },
  {
    id: 'publishing',
    title: 'Publishing',
    icon: <Sparkles size={18} />, 
    intro: 'Learn how to publish your project and what happens after you build your site.',
    sections: [
      {
        title: 'Publish workflow',
        paragraphs: [
          'After editing a project, use the publish options to make the latest version available. The publish flow saves your current builder state and deploys updates.',
        ],
      },
      {
        title: 'Preview and live content',
        paragraphs: [
          'Use the preview tools to verify the page layout before publishing. Live content is served from the applied project settings and published configuration.',
        ],
      },
    ],
  },
];

export default function DocumentationPage() {
  const [selectedTopicId, setSelectedTopicId] = useState(TOPICS[0].id);
  const selectedTopic = useMemo(
    () => TOPICS.find(topic => topic.id === selectedTopicId) || TOPICS[0],
    [selectedTopicId]
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-row gap-6">
          <aside className="flex flex-col w-[15%] max-lg:hidden">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <img src="/logobuilder.png" alt="Luniobuilder Logo" className="h-8 w-auto invert dark:invert" />
                <p className="mt-2 text-sm font-semibold text-black">Official documentation for LUNIO Builder. Go through each category for more informartion.</p>
              </div>
            </div>

            <nav className="space-y-3">
              {TOPICS.map(topic => {
                const active = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={
                      `w-full rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                        active
                          ? 'text-black'
                          : 'text-black'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-black">{topic.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{topic.title}</p>
                        <p className="mt-1 text-xs text-black">{topic.intro}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex w-[75%] p-8">

            <div className="space-y-12">
              {selectedTopic.sections.map((section, index) => (
                <section key={index} className="scroll-mt-24">
                  <h3 className="text-2xl font-semibold text-black">{section.title}</h3>
                  <div className="mt-4 space-y-4 text-black">
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                    {section.list && (
                      <ul className="space-y-3 text-black">
                        {section.list.map((item, itemIndex) => (
                          <li key={itemIndex} className=" pl-5">{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
