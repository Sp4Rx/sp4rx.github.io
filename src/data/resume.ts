export const resumeData = {
  basics: {
    name: "Suvajit Sarkar",
    label: "Software Engineer",
    email: "hello@suvajit.in",
    phone: "+91 981 151 4646",
    showPhoneNumber: false,
    url: "about.me/suvajit",
    summary: "Developer with 8 years of experience working with Flutter, Firebase, Figma, Dio, Bloc, Riverpod, Java, Kotlin, React Native. I have developed successful apps that have touched millions of people. Proficient in Python and experienced with AWS.\n\nIn addition to mobile and backend development, I have a growing expertise in AI-driven content generation. I actively work with ComfyUI, Stable Diffusion, Flux.1 and AI-based image/video generation. I also experiment with LLMs (Gemini API) for automation and creative workflows.",
    location: {
      region: "West Bengal",
      city: "Krishnanagar",
    },
    stackOverflowId: "4768512",
    stackOverflowUsername: "sp4rx",
    profiles: [
      {
        network: "GitHub",
        username: "sp4rx",
        url: "https://github.com/sp4rx"
      },
      {
        network: "LinkedIn",
        username: "heysuvajit",
        url: "https://linkedin.com/in/heysuvajit"
      },
      {
        network: "x",
        username: "@heysuvajit",
        url: "https://x.com/heysuvajit"
      },
      {
        network: "Telegram",
        username: "heysuvajit",
        url: "https://telegram.me/heysuvajit"
      }
    ]
  },
  skills: [
    {
      group: "Mobile Development",
      items: [
        {
          name: "Flutter & Dart",
          level: 90,
          keywords: ["Flutter", "Dart", "Firebase", "Figma", "Dio", "Bloc", "Riverpod"]
        },
        {
          name: "React Native",
          level: 60
        },
        {
          name: "Kotlin",
          level: 60
        },
        {
          name: "Java",
          level: 80
        }
      ]
    },
    {
      group: "Frontend Development",
      items: [
        {
          name: "React JS",
          level: 50
        }
      ]
    },
    {
      group: "Backend & Cloud",
      items: [
        {
          name: "Python",
          level: 60
        },
        {
          name: "AWS",
          level: 50
        }
      ]
    },
    {
      group: "DevOps & Tools",
      items: [
        {
          name: "Docker",
          level: 50
        },
        {
          name: "Jenkins/Github Actions",
          level: 50
        }
      ]
    },
    {
      group: "AI & ML",
      items: [
        {
          name: "ComfyUI",
          level: 50
        },
        {
          name: "AI Image & Video Generation (Gen-2, SD, OpenAI)",
          level: 50
        },
        {
          name: "Gemini API / LLMs",
          level: 50
        }
      ]
    }
  ],
  work: [
    {
      company: "Tailorbird",
      position: "Senior Full Stack Developer",
      website: "https://www.tailorbird.com/",
      startDate: "2023-06",
      endDate: "2024-01",
      summary: "Worked on AI-powered multifamily renovation platform.",
      highlights: [
        "Setting up the foundation of the Flutter app architecture using Bloc, GraphQL, Hive",
        "Implemented Forge Viewer for viewing Revit models of buildings/projects",
        "Created architecture for PDF generation used for report generation",
        "Contributed to APIs and Flutter app features"
      ],
      technologies: ["Flutter", "Bloc", "GraphQL", "Hive", "Python"]
    },
    {
      company: "Tranzact",
      position: "Software Engineer",
      website: "https://letstranzact.com/",
      startDate: "2022-06",
      endDate: "2023-02",
      summary: "Worked as Flutter developer digitizing SME manufacturers.",
      highlights: [
        "Restructured the app using Riverpod",
        "Maintained crash-free users at 99%",
        "Implemented push notifications using MoEngage with A/B testing",
        "Set up separate prod and dev environments",
        "Managed a small team"
      ],
      technologies: ["Flutter", "Riverpod", "MoEngage"]
    },
    {
      company: "Vedantu",
      position: "Software Engineer",
      website: "https://www.vedantu.com/",
      startDate: "2020-08",
      endDate: "2022-05",
      summary: "Worked on growth team for online education platform.",
      highlights: [
        "Implemented live video streaming and socket communication",
        "Written Jenkins scripts in groovy for building android apk",
        "Dockerized FE project for development and QA",
        "Contributed to website using React and Next.js"
      ],
      technologies: ["React Native", "Jenkins", "Docker", "React", "Next.js"]
    },
    {
      company: "Bounce",
      position: "Software Engineer",
      website: "https://play.google.com/store/apps/details?id=com.metrobikes.app",
      startDate: "2020-02",
      endDate: "2020-07",
      summary: "Worked on rental scooter & bike service app.",
      highlights: [
        "Worked on consumer side features",
        "Developed Hawkeye project (Bounce Hero App)",
        "Implemented Sentry for crash reporting"
      ],
      technologies: ["Flutter", "Sentry"]
    },
    {
      company: "Leher.ai Pvt. Ltd",
      position: "SDE II",
      website: "https://play.google.com/store/apps/details?id=com.leher",
      startDate: "2019-01",
      endDate: "2020-02",
      summary: "Worked on video discussion social platform.",
      highlights: [
        "Boosted app stability to 98% from 75% within 20 days",
        "Implemented Dagger",
        "Built full-screen video feed",
        "Rewrote whole app in Flutter for v4.0"
      ],
      technologies: ["Android", "MVP", "Dagger", "Flutter"]
    }
  ],
  projects: [
    {
      name: "8-Bit Resume",
      description: "An interactive 8-bit themed resume game that combines retro gaming with professional portfolio presentation. At its core, it features a classic snake game where you control a colorful snake that grows longer as it collects food, while avoiding self-collision. The game seamlessly integrates with your professional portfolio - the snake's movements and interactions create an engaging way to navigate through your experience, skills, and achievements. Experience a unique way of showcasing professional experience through a nostalgic pixel art interface.",
      highlights: [
        "Snake game mechanics",
        "Dynamic portfolio data",
        "Pixel art retro design",
      ],
      url: "https://suvajit.in",
      githubUrl: "https://github.com/Sp4Rx/sp4rx.github.io",
      technologies: ["React", "Vite"]
    },
    {

      name: "ComfyUI",
      description: "ComfyUI is an open-source and modular node-based graphical user interface for Stable Diffusion. It allows you to create and share custom workflows by connecting different nodes together.",
      highlights: [
        "Node-based UI",
        "Customizable workflows",
        "Modular architecture",
      ],
      url: "https://suvajit.in",
      technologies: ["Python", "PyTorch", "Stable Diffusion"]
    },
    {
      name: "Flux.1",
      description: "Flux.1 is an AI-driven content generation platform that leverages the power of AI to generate high-quality images and videos. It provides a user-friendly interface for creating and customizing prompts, and then generates images and videos based on those prompts.",
      highlights: [
        "AI-driven content generation",
        "User-friendly interface",
        "Customizable prompts",
      ],
      technologies: ["Python", "AI", "Image Generation"]
    }
  ],
  education: [
    {
      institution: "St. Thomas' College of Engineering and Technology, Kolkata",
      area: "Computer Science & Engineering",
      gpa: "",
      studyType: "Bachelor's",
      startDate: "2013-06",
      endDate: "2016-06",
      courses: []
    }
  ],
  languages: [
    {
      language: "Bengali",
      fluency: "Native"
    },
    {
      language: "English",
      fluency: "Professional"
    },
    {
      language: "Hindi",
      fluency: "Professional"
    }
  ],
  interests: [
    {
      name: "Gaming",
      keywords: ["Steam"],
      links: [
        {
          name: "Steam Profile",
          url: "https://steamcommunity.com/id/suvajit"
        }
      ]
    },
    {
      name: "Youtube",
      keywords: ["Content Creation"],
      links: [
        {
          name: "YouTube Channel",
          url: "https://youtube.com/@_sp4rx_"
        }
      ]
    }
  ]
};