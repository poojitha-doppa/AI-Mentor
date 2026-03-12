import { NextRequest, NextResponse } from 'next/server'
import { getBestVideo } from '@/services/videoIntelligence'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, answers } = body

    console.log('=== COURSE GENERATION REQUEST ===')
    console.log('Topic:', topic)
    console.log('Answers received:', answers)

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      console.error('OpenRouter API key is not configured')
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    // LANGUAGE LEARNING RESOURCES DATABASE - Real, Working Courses
    const languageLearningResources: { [key: string]: Array<{ type: string; title: string; url: string }> } = {
      italian: [
        { type: 'course', title: 'Duolingo Italian Course', url: 'https://www.duolingo.com/course/it/en/Learn-Italian' },
        { type: 'course', title: 'Babbel Italian Complete Course', url: 'https://www.babbel.com/en/learn-italian' },
        { type: 'youtube-channel', title: 'Easy Italian by Easy Languages', url: 'https://www.youtube.com/@EasyItalian' },
        { type: 'app', title: 'Memrise Italian Learning', url: 'https://www.memrise.com/learn/italian/' },
        { type: 'course', title: 'Busuu Italian Course', url: 'https://www.busuu.com/en/courses/learn-italian-online' },
      ],
      spanish: [
        { type: 'course', title: 'Duolingo Spanish Course', url: 'https://www.duolingo.com/course/es/en/Learn-Spanish' },
        { type: 'course', title: 'Babbel Spanish Complete Course', url: 'https://www.babbel.com/en/learn-spanish' },
        { type: 'youtube-channel', title: 'Easy Spanish by Easy Languages', url: 'https://www.youtube.com/@EasySpanish' },
        { type: 'course', title: 'Busuu Spanish Learning', url: 'https://www.busuu.com/en/courses/learn-spanish-online' },
        { type: 'app', title: 'Memrise Spanish Learning', url: 'https://www.memrise.com/learn/spanish/' },
      ],
      french: [
        { type: 'course', title: 'Duolingo French Course', url: 'https://www.duolingo.com/course/fr/en/Learn-French' },
        { type: 'course', title: 'Babbel French Complete Course', url: 'https://www.babbel.com/en/learn-french' },
        { type: 'youtube-channel', title: 'Easy French by Easy Languages', url: 'https://www.youtube.com/@EasyFrench' },
        { type: 'course', title: 'RFI Savoirs French Learning', url: 'https://savoirs.rfi.fr/en' },
        { type: 'app', title: 'Memrise French Learning', url: 'https://www.memrise.com/learn/french/' },
      ],
      german: [
        { type: 'course', title: 'Duolingo German Course', url: 'https://www.duolingo.com/course/de/en/Learn-German' },
        { type: 'course', title: 'Babbel German Complete Course', url: 'https://www.babbel.com/en/learn-german' },
        { type: 'youtube-channel', title: 'Easy German by Easy Languages', url: 'https://www.youtube.com/@EasyGerman' },
        { type: 'course', title: 'Deutsche Welle German Courses', url: 'https://www.dw.com/en/learn-german/s-2469' },
        { type: 'app', title: 'Memrise German Learning', url: 'https://www.memrise.com/learn/german/' },
      ],
      portuguese: [
        { type: 'course', title: 'Duolingo Portuguese Course', url: 'https://www.duolingo.com/course/pt/en/Learn-Portuguese' },
        { type: 'course', title: 'Babbel Portuguese Course', url: 'https://www.babbel.com/en/learn-portuguese' },
        { type: 'youtube-channel', title: 'Easy Portuguese by Easy Languages', url: 'https://www.youtube.com/@EasyPortuguese' },
        { type: 'app', title: 'Memrise Portuguese Learning', url: 'https://www.memrise.com/learn/portuguese/' },
      ],
      japanese: [
        { type: 'course', title: 'Duolingo Japanese Course', url: 'https://www.duolingo.com/course/ja/en/Learn-Japanese' },
        { type: 'course', title: 'NHK World Japanese Course', url: 'https://www.nhk.or.jp/world/en/learnjapanese/' },
        { type: 'youtube-channel', title: 'Easy Japanese by NHK World', url: 'https://www.youtube.com/@NHKWorld' },
        { type: 'course', title: 'Marugoto Online Courses', url: 'https://marugotoonline.waseda.jp/en/' },
      ],
      chinese: [
        { type: 'course', title: 'Duolingo Chinese Course', url: 'https://www.duolingo.com/course/zh/en/Learn-Chinese' },
        { type: 'course', title: 'CCTV Learn Chinese', url: 'https://learnchinese.cctv.com/' },
        { type: 'youtube-channel', title: 'Easy Chinese by Easy Languages', url: 'https://www.youtube.com/@EasyChinese' },
      ],
      korean: [
        { type: 'course', title: 'Duolingo Korean Course', url: 'https://www.duolingo.com/course/ko/en/Learn-Korean' },
        { type: 'course', title: 'KBS World Korean Courses', url: 'https://world.kbs.co.kr/service/contents.html?lang=e' },
        { type: 'youtube-channel', title: 'Learn Korean with GO! Billy Korean', url: 'https://www.youtube.com/@GobillyKorean' },
      ],
    }

    // Helper function to generate HIGHLY SPECIFIC YouTube search queries per module
    // This ensures each module gets unique, relevant videos from live YouTube data
    const generateModuleVideoSearch = (moduleTitle: string, moduleTopic: string, moduleNum: number, totalModules: number, courseTopic: string) => {
      // Clean up module topic - remove "Module X:" prefix
      const cleanTopic = moduleTopic.replace(/^Module\s*\d+[:\s]*/i, '').trim()
      
      // Extract ALL concepts from the module title for better specificity
      // Split by common separators: commas, 'and', '&'
      const concepts = cleanTopic
        .split(/[,&]/)
        .map(c => c.replace(/\band\b/gi, '').trim())
        .filter(c => c.length > 2)
      
      // Determine difficulty level based on module position
      const progressPercentage = (moduleNum / totalModules)
      let difficultyKeyword: string
      
      if (progressPercentage < 0.30) {
        difficultyKeyword = 'tutorial for beginners'
      } else if (progressPercentage < 0.70) {
        difficultyKeyword = 'complete guide'
      } else {
        difficultyKeyword = 'advanced concepts'
      }
      
      // Include topic context in search for better specificity
      const topicPrefix = courseTopic ? `${courseTopic} ` : ''
      
      // Build HIGHLY SPECIFIC search query with topic context
      if (concepts.length >= 2) {
        // Use multiple concepts to ensure unique videos per module
        return `${topicPrefix}${concepts[0]} ${concepts[1]} ${difficultyKeyword}`
      } else if (concepts.length === 1) {
        // Single concept - add module number context for uniqueness
        return `${topicPrefix}${concepts[0]} ${difficultyKeyword}`
      } else {
        // Fallback - use full clean topic with course prefix
        return `${topicPrefix}${cleanTopic} ${difficultyKeyword}`
      }
    }

    // Helper function to validate URLs are real (not placeholders)
    const isValidResourceUrl = (url: string): boolean => {
      if (!url) return false
      // Exclude demo/placeholder URL patterns
      const invalidPatterns = [
        'example.com',
        'placeholder',
        'demo.com',
        'test.com',
        'localhost',
        'https://youtube.com$', // just plain youtube without video ID
        'https://youtube.com/',
        'youtube.com/results', // generic search page
      ]
      
      const lowerUrl = url.toLowerCase()
      return !invalidPatterns.some(pattern => lowerUrl.includes(pattern.toLowerCase()))
    }

    // Helper function to generate REAL reading materials for a module
    const generateReadingMaterials = (moduleTopic: string, moduleNum: number, difficulty: string, courseTopic: string = '') => {
      // Clean up module topic for better URL matching
      const cleanTopic = moduleTopic.replace(/^Module\s+\d+:\s*/i, '').trim()
      const topicLower = cleanTopic.toLowerCase()
      const courseTopicLower = courseTopic.toLowerCase()

      // CHECK 1: If this is a language course, return language learning resources
      const languageTopics = ['italian', 'spanish', 'french', 'german', 'portuguese', 'japanese', 'chinese', 'korean', 'russian', 'arabic', 'hindi']
      const isLanguageCourse = languageTopics.some(lang => courseTopicLower.includes(lang))
      
      if (isLanguageCourse) {
        // Return language learning resources for ANY module in a language course
        for (const [language, resources] of Object.entries(languageLearningResources)) {
          if (courseTopicLower.includes(language)) {
            console.log(`Returning language learning resources for ${language} course`)
            return resources
          }
        }
      }

      // Otherwise, proceed with technical content matching
      // Extract all individual concepts from the module title
      const concepts = cleanTopic.split(/[,&]/).map(c => c.trim()).filter(c => c.length > 0)

      // Curated keyword-to-resource mapping for higher precision
      const keywordResources: Record<string, { official?: { title: string; url: string }; gfg?: string; fcc?: string; devto?: string }> = {
        // JavaScript core
        'variables': { official: { title: 'MDN - Values, Variables, and Literals', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types' }, gfg: 'https://www.geeksforgeeks.org/variables-in-javascript/' },
        'data types': { official: { title: 'MDN - Data Types and Structures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures' }, gfg: 'https://www.geeksforgeeks.org/javascript-data-types/' },
        'operators': { official: { title: 'MDN - Expressions and Operators', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators' }, gfg: 'https://www.geeksforgeeks.org/javascript-operators/' },
        'functions': { official: { title: 'MDN - Functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' }, gfg: 'https://www.geeksforgeeks.org/javascript-functions/' },
        'arrays': { official: { title: 'MDN - Array Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' }, gfg: 'https://www.geeksforgeeks.org/javascript-array/' },
        'objects': { official: { title: 'MDN - Working with Objects', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects' }, gfg: 'https://www.geeksforgeeks.org/objects-in-javascript/' },
        'promises': { official: { title: 'MDN - Using Promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises' }, gfg: 'https://www.geeksforgeeks.org/javascript-promises/' },
        'async': { official: { title: 'MDN - Async/Await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function' }, gfg: 'https://www.geeksforgeeks.org/async-await-function-in-javascript/' },
        'dom': { official: { title: 'MDN - DOM Introduction', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction' }, gfg: 'https://www.geeksforgeeks.org/dom-document-object-model/' },
        'event': { official: { title: 'MDN - Events Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events' }, gfg: 'https://www.geeksforgeeks.org/javascript-events/' },
        'closure': { official: { title: 'MDN - Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures' }, gfg: 'https://www.geeksforgeeks.org/closure-in-javascript/' },

        // CSS
        'flexbox': { official: { title: 'MDN - CSS Flexible Box Layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout' }, gfg: 'https://www.geeksforgeeks.org/css-flexbox-complete-guide/', fcc: 'https://www.freecodecamp.org/news/css-flexbox-tutorial-with-cheatsheet/' },
        'grid': { official: { title: 'MDN - CSS Grid Layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout' }, gfg: 'https://www.geeksforgeeks.org/css-grid-layout/', fcc: 'https://www.freecodecamp.org/news/css-grid-tutorial-with-cheatsheet/' },
        'responsive': { official: { title: 'MDN - Responsive Design', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design' }, gfg: 'https://www.geeksforgeeks.org/what-is-responsive-web-design/' },
        'accessibility': { official: { title: 'MDN - Accessibility Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility' }, gfg: 'https://www.geeksforgeeks.org/web-accessibility-guide/' },

        // HTML
        'html': { official: { title: 'MDN - HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }, gfg: 'https://www.geeksforgeeks.org/html/' },
        'forms': { official: { title: 'MDN - HTML Forms', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms' }, gfg: 'https://www.geeksforgeeks.org/html-forms/' },
        'semantic': { official: { title: 'MDN - Semantic HTML', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics' }, gfg: 'https://www.geeksforgeeks.org/semantic-html/' },

        // React
        'react': { official: { title: 'React - Main Documentation', url: 'https://react.dev' }, gfg: 'https://www.geeksforgeeks.org/react-tutorial/' },
        'components': { official: { title: 'React - Describing the UI', url: 'https://react.dev/learn/describing-the-ui' }, gfg: 'https://www.geeksforgeeks.org/reactjs-components/' },
        'hooks': { official: { title: 'React Hooks - Reference', url: 'https://react.dev/reference/react' }, gfg: 'https://www.geeksforgeeks.org/react-hooks/' },
        'state': { official: { title: 'React - Managing State', url: 'https://react.dev/learn/managing-state' }, gfg: 'https://www.geeksforgeeks.org/reactjs-state/' },
        'props': { official: { title: 'React - Passing Props', url: 'https://react.dev/learn/passing-props-to-a-component' }, gfg: 'https://www.geeksforgeeks.org/reactjs-props/' },
        'routing': { official: { title: 'React Router - Getting Started', url: 'https://reactrouter.com/en/main/start/tutorial' }, gfg: 'https://www.geeksforgeeks.org/reactjs-router/' },
        'context': { official: { title: 'React Context API', url: 'https://react.dev/reference/react/useContext' }, gfg: 'https://www.geeksforgeeks.org/context-api-in-react/' },

        // Node / Backend
        'express': { official: { title: 'Express Official Guide', url: 'https://expressjs.com/en/starter/installing.html' }, gfg: 'https://www.geeksforgeeks.org/express-js/' },
        'rest': { official: { title: 'MDN - REST Concepts', url: 'https://developer.mozilla.org/en-US/docs/Glossary/REST' }, gfg: 'https://www.geeksforgeeks.org/rest-api-introduction/' },
        'api': { official: { title: 'MDN - Web APIs', url: 'https://developer.mozilla.org/en-US/docs/Web/API' }, gfg: 'https://www.geeksforgeeks.org/api-full-form/' },
        'authentication': { official: { title: 'OWASP - Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' }, gfg: 'https://www.geeksforgeeks.org/authentication-vs-authorization/' },
        'jwt': { official: { title: 'JWT - Introduction', url: 'https://jwt.io/introduction' }, gfg: 'https://www.geeksforgeeks.org/jwt-authentication-with-node-js/' },
        'mongodb': { official: { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' }, gfg: 'https://www.geeksforgeeks.org/mongodb-tutorial/' },
        'database': { official: { title: 'MDN - Databases', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Database' }, gfg: 'https://www.geeksforgeeks.org/databases/' },

        // SQL
        'sql': { official: { title: 'W3Schools - SQL Tutorial', url: 'https://www.w3schools.com/sql/' }, gfg: 'https://www.geeksforgeeks.org/sql-tutorial/' },
        'joins': { official: { title: 'W3Schools - SQL Joins', url: 'https://www.w3schools.com/sql/sql_join.asp' }, gfg: 'https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/' },
        'queries': { official: { title: 'W3Schools - SQL Select', url: 'https://www.w3schools.com/sql/sql_select.asp' }, gfg: 'https://www.geeksforgeeks.org/sql-queries/' },

        // Tooling
        'git': { official: { title: 'Git Book - Pro Git', url: 'https://git-scm.com/book/en/v2' }, gfg: 'https://www.geeksforgeeks.org/git-tutorial/' },
        'docker': { official: { title: 'Docker Docs - Get Started', url: 'https://docs.docker.com/get-started/' }, gfg: 'https://www.geeksforgeeks.org/docker-tutorial/' },
        'webpack': { official: { title: 'Webpack Docs', url: 'https://webpack.js.org/concepts/' }, gfg: 'https://www.geeksforgeeks.org/webpack/' },

        // Testing
        'jest': { official: { title: 'Jest Docs', url: 'https://jestjs.io/docs/getting-started' }, gfg: 'https://www.geeksforgeeks.org/introduction-to-jest-testing-framework/' },
        'cypress': { official: { title: 'Cypress Docs - Core Concepts', url: 'https://docs.cypress.io/guides/core-concepts/introduction-to-cypress' }, gfg: 'https://www.geeksforgeeks.org/cypress-an-overview-and-its-commands/' },
        'testing': { official: { title: 'Testing Library Docs', url: 'https://testing-library.com/docs/' }, gfg: 'https://www.geeksforgeeks.org/software-testing/' },

        // Python
        'python': { official: { title: 'Python Official Docs', url: 'https://docs.python.org/3/' }, gfg: 'https://www.geeksforgeeks.org/python-tutorial/' },
        'pandas': { official: { title: 'Pandas Docs - Getting Started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' }, gfg: 'https://www.geeksforgeeks.org/pandas-tutorial/' },
        'numpy': { official: { title: 'NumPy User Guide', url: 'https://numpy.org/doc/stable/user/' }, gfg: 'https://www.geeksforgeeks.org/numpy/' },
        'oop': { official: { title: 'Python OOP Tutorial', url: 'https://docs.python.org/3/tutorial/classes.html' }, gfg: 'https://www.geeksforgeeks.org/python-oops-concepts/' },

        // Machine Learning & Data Science
        'machine learning': { official: { title: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/' }, gfg: 'https://www.geeksforgeeks.org/machine-learning/' },
        'supervised learning': { official: { title: 'ML - Supervised Learning', url: 'https://scikit-learn.org/stable/supervised_learning.html' }, gfg: 'https://www.geeksforgeeks.org/supervised-machine-learning/' },
        'unsupervised learning': { official: { title: 'ML - Unsupervised Learning', url: 'https://scikit-learn.org/stable/unsupervised_learning.html' }, gfg: 'https://www.geeksforgeeks.org/unsupervised-learning-in-machine-learning/' },
        'regression': { official: { title: 'Scikit-learn Regression', url: 'https://scikit-learn.org/stable/modules/linear_model.html' }, gfg: 'https://www.geeksforgeeks.org/linear-regression-python-implementation/' },
        'classification': { official: { title: 'Scikit-learn Classification', url: 'https://scikit-learn.org/stable/modules/classification.html' }, gfg: 'https://www.geeksforgeeks.org/classification-algorithms-in-machine-learning/' },
        'decision trees': { official: { title: 'Scikit-learn Decision Trees', url: 'https://scikit-learn.org/stable/modules/tree.html' }, gfg: 'https://www.geeksforgeeks.org/decision-tree-implementation-python/' },
        'random forest': { official: { title: 'Scikit-learn Random Forest', url: 'https://scikit-learn.org/stable/modules/ensemble.html#random-forests' }, gfg: 'https://www.geeksforgeeks.org/random-forest-regression-in-python/' },
        'neural networks': { official: { title: 'Neural Networks Deep Learning', url: 'https://www.deeplearningbook.org/' }, gfg: 'https://www.geeksforgeeks.org/neural-networks-a-beginners-guide/' },
        'tensorflow': { official: { title: 'TensorFlow Official Guide', url: 'https://www.tensorflow.org/guide' }, gfg: 'https://www.geeksforgeeks.org/tensorflow-tutorial/' },
        'deep learning': { official: { title: 'Deep Learning Book', url: 'https://www.deeplearningbook.org/' }, gfg: 'https://www.geeksforgeeks.org/deep-learning/' },
        'computer vision': { official: { title: 'OpenCV Documentation', url: 'https://docs.opencv.org/' }, gfg: 'https://www.geeksforgeeks.org/opencv-python-tutorial/' },
        'nlp': { official: { title: 'NLTK Book', url: 'https://www.nltk.org/book/' }, gfg: 'https://www.geeksforgeeks.org/natural-language-processing-nlp-tutorial/' },
        'data preprocessing': { official: { title: 'Scikit-learn Preprocessing', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' }, gfg: 'https://www.geeksforgeeks.org/data-preprocessing-machine-learning/' },
      }

      // Try to find matching resources by checking each concept
      const materials = []
      
      // First pass: look for exact concept matches
      for (const concept of concepts) {
        const conceptLower = concept.toLowerCase()
        for (const [keyword, resources] of Object.entries(keywordResources)) {
          if (keyword === conceptLower || conceptLower.includes(keyword) || keyword.includes(conceptLower)) {
            if (resources.official) {
              materials.push({
                type: 'documentation',
                title: resources.official.title,
                url: resources.official.url,
              })
            }
            if (resources.gfg) {
              materials.push({
                type: 'tutorial',
                title: `GeeksforGeeks - ${keyword}`,
                url: resources.gfg,
              })
            }
            break
          }
        }
      }

      // If we found specific materials, return them
      if (materials.length > 0) {
        return materials
      }
      
      // FALLBACK STRATEGY: Use course topic as context
      // First check if course topic itself matches known topics
      const topicMap: { [key: string]: string } = {
          // JavaScript
          'javascript': 'https://www.geeksforgeeks.org/javascript/',
          'js': 'https://www.geeksforgeeks.org/javascript/',
          // TypeScript
          'typescript': 'https://www.geeksforgeeks.org/typescript/',
          // React
          'react': 'https://www.geeksforgeeks.org/react-tutorial/',
          // Node.js
          'node': 'https://www.geeksforgeeks.org/nodejs/',
          'nodejs': 'https://www.geeksforgeeks.org/nodejs-tutorial/',
          'node.js': 'https://www.geeksforgeeks.org/nodejs/',
          // Python
          'python': 'https://www.geeksforgeeks.org/python-programming-language/',
          'python basics': 'https://www.geeksforgeeks.org/python-programming-language-tutorial/',
          'python fundamentals': 'https://www.geeksforgeeks.org/python-basics/',
          // CSS
          'css': 'https://www.geeksforgeeks.org/css-tutorial/',
          'css basics': 'https://www.geeksforgeeks.org/css/',
          // HTML
          'html': 'https://www.geeksforgeeks.org/html-tutorial/',
          'html basics': 'https://www.geeksforgeeks.org/html/',
          // SQL
          'sql': 'https://www.geeksforgeeks.org/sql-tutorial/',
          'database': 'https://www.geeksforgeeks.org/dbms/',
          'databases': 'https://www.geeksforgeeks.org/introduction-of-dbms/',
          // Git
          'git': 'https://www.geeksforgeeks.org/git-tutorial/',
          'version control': 'https://www.geeksforgeeks.org/version-control-systems/',
          // Data Structures
          'arrays': 'https://www.geeksforgeeks.org/array-data-structure/',
          'linked list': 'https://www.geeksforgeeks.org/data-structures/linked-list/',
          'trees': 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
          'graphs': 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
          // Algorithms
          'sorting': 'https://www.geeksforgeeks.org/sorting-algorithms/',
          'searching': 'https://www.geeksforgeeks.org/searching-algorithms/',
          'dynamic programming': 'https://www.geeksforgeeks.org/dynamic-programming/',
          'algorithms': 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
        }
        
        // Try exact match first
        const lower = cleanTopic.toLowerCase()
        if (topicMap[lower]) {
          return [
            {
              type: 'documentation',
              title: `${cleanTopic} - Official Resources`,
              url: topicMap[lower],
            }
          ]
        }
        
        // Try partial matches on module title
        for (const [key, url] of Object.entries(topicMap)) {
          if (lower.includes(key) || key.includes(lower.split(' ')[0])) {
            return [
              {
                type: 'documentation',
                title: `${cleanTopic} - Resources`,
                url: url,
              }
            ]
          }
        }
        
        // TRY COURSE TOPIC: If module title didn't match, try matching the course topic itself
        // This is important for language + programming courses where modules might not have exact keywords
        const courseLower = courseTopicLower
        
        // Try exact match for course topic
        if (topicMap[courseLower]) {
          return [
            {
              type: 'documentation',
              title: `${courseTopic} - ${cleanTopic} Resources`,
              url: topicMap[courseLower],
            }
          ]
        }
        
        // Try partial match for course topic
        for (const [key, url] of Object.entries(topicMap)) {
          if (courseLower.includes(key) || key.includes(courseLower.split(' ')[0])) {
            return [
              {
                type: 'documentation',
                title: `${courseTopic} - ${cleanTopic}`,
                url: url,
              }
            ]
          }
        }
        
        // Final fallback to REAL article URLs (not generic search pages)
        // These are specific, working articles for the topic
        const searchTerm = encodeURIComponent(cleanTopic)
        
        // Use course topic in fallback if available
        const fallbackTopic = courseTopic || cleanTopic
        
        return [
          {
            type: 'tutorial',
            title: `${fallbackTopic} - GeeksforGeeks Tutorial`,
            url: `https://www.geeksforgeeks.org/${fallbackTopic.toLowerCase().replace(/\s+/g, '-')}/`,
          },
          {
            type: 'documentation',
            title: `${cleanTopic} - Official Documentation Search`,
            url: `https://duckduckgo.com/?q=site:official+${searchTerm}+documentation`,
          },
          {
            type: 'article',
            title: `${cleanTopic} - Dev.to Community Articles`,
            url: `https://dev.to/search?q=${searchTerm}&filters=tag:tutorial`,
          },
          {
            type: 'tutorial',
            title: `${cleanTopic} - W3Schools Reference`,
            url: `https://www.w3schools.com/${cleanTopic.toLowerCase().replace(/\s+/g, '')}/`,
          }
        ]
    }

    // Helper function to generate real course-level resources based on user profile and topic
    const generateCourseResources = (
      courseTopic: string,
      userGoal: string,
      experience: string,
      timeline: string,
      learningStyle: string
    ) => {
      // Comprehensive mapping of topics to real, complete learning resources
      // Each resource is a full course, playlist, or documentation - NOT just search results
      const topicResourceMap: {
        [key: string]: {
          beginner: Array<{ type: string; title: string; url: string }>;
          intermediate: Array<{ type: string; title: string; url: string }>;
          advanced: Array<{ type: string; title: string; url: string }>;
        };
      } = {
        react: {
          beginner: [
            { type: 'official-docs', title: 'React Official Documentation - Beginner', url: 'https://react.dev/learn' },
            { type: 'video-course', title: 'React Complete Guide - freeCodeCamp (7 hours)', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
            { type: 'interactive-tutorial', title: 'Scrimba - Learn React', url: 'https://scrimba.com/learn/learnreact' },
            { type: 'documentation', title: 'React TypeScript Cheatsheet', url: 'https://react-typescript-cheatsheet.netlify.app' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'React Advanced Patterns', url: 'https://react.dev/reference' },
            { type: 'video-course', title: 'Advanced React Patterns - Frontend Masters', url: 'https://frontendmasters.com/courses/advanced-react-patterns/' },
            { type: 'documentation', title: 'React Hooks Deep Dive', url: 'https://www.epicreact.dev' },
            { type: 'github-resources', title: 'Awesome React - Comprehensive Collection', url: 'https://github.com/enaqx/awesome-react' },
          ],
          advanced: [
            { type: 'official-docs', title: 'React Internals & Architecture', url: 'https://github.com/facebook/react/tree/main/docs' },
            { type: 'video-course', title: 'React Performance Optimization - Kent C. Dodds', url: 'https://egghead.io/courses/fix-common-performance-issues-that-expose-you-to-react-anti-patterns' },
            { type: 'documentation', title: 'React Server Components', url: 'https://react.dev/reference/react/use-server' },
            { type: 'github-resources', title: 'React Design Patterns & Best Practices', url: 'https://github.com/alan2207/bulletproof-react' },
          ],
        },
        javascript: {
          beginner: [
            { type: 'official-docs', title: 'MDN JavaScript Guide for Beginners', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript' },
            { type: 'video-course', title: 'JavaScript Basics - freeCodeCamp (8 hours)', url: 'https://www.youtube.com/watch?v=jS4aFq5-91M' },
            { type: 'interactive-tutorial', title: 'JavaScript.info - Beginner Track', url: 'https://javascript.info' },
            { type: 'documentation', title: 'You Don\'t Know JS (Book Series)', url: 'https://github.com/getify/You-Dont-Know-JS' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'MDN Web Docs - Advanced JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
            { type: 'video-course', title: 'JavaScript Advanced Concepts - Frontend Masters', url: 'https://frontendmasters.com/courses/javascript-hardparts/' },
            { type: 'practice-platform', title: 'LeetCode - JavaScript Medium Problems', url: 'https://leetcode.com/problemset/?difficulty=MEDIUM&lang=javascript' },
            { type: 'documentation', title: 'Eloquent JavaScript (Interactive Book)', url: 'https://eloquentjavascript.net' },
          ],
          advanced: [
            { type: 'official-docs', title: 'ECMA-262 JavaScript Specification', url: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-262/' },
            { type: 'video-course', title: 'JavaScript: The Hard Parts - Will Sentance', url: 'https://frontendmasters.com/courses/javascript-hard-parts/' },
            { type: 'practice-platform', title: 'LeetCode - JavaScript Hard Problems', url: 'https://leetcode.com/problemset/?difficulty=HARD&lang=javascript' },
            { type: 'github-resources', title: '33 JavaScript Concepts Every Developer Should Know', url: 'https://github.com/leonardomso/33-js-concepts' },
          ],
        },
        python: {
          beginner: [
            { type: 'official-docs', title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
            { type: 'video-course', title: 'Python for Beginners - freeCodeCamp (4 hours)', url: 'https://www.youtube.com/watch?v=rfscVS0vtik' },
            { type: 'interactive-tutorial', title: 'Real Python Tutorials - Beginner', url: 'https://realpython.com/start-here/' },
            { type: 'documentation', title: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'Python Documentation - Full Reference', url: 'https://docs.python.org/3/library/index.html' },
            { type: 'video-course', title: 'Intermediate Python - Real Python', url: 'https://realpython.com/intermediate-python/' },
            { type: 'practice-platform', title: 'HackerRank - Python Intermediate', url: 'https://www.hackerrank.com/domains/python' },
            { type: 'documentation', title: 'Fluent Python (Book Series)', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492077459/' },
          ],
          advanced: [
            { type: 'official-docs', title: 'Python Enhancement Proposals (PEPs)', url: 'https://peps.python.org/' },
            { type: 'video-course', title: 'Python Design Patterns - Real Python', url: 'https://realpython.com/design-patterns/' },
            { type: 'practice-platform', title: 'LeetCode - Python Hard Problems', url: 'https://leetcode.com/problemset/?difficulty=HARD&lang=python' },
            { type: 'github-resources', title: 'Awesome Python - Curated List', url: 'https://github.com/vinta/awesome-python' },
          ],
        },
        'web development': {
          beginner: [
            { type: 'official-docs', title: 'MDN Web Docs - Get Started', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
            { type: 'video-course', title: 'Web Development for Beginners - freeCodeCamp', url: 'https://www.youtube.com/watch?v=zJSY8tbf_ys' },
            { type: 'interactive-tutorial', title: 'Codecademy - Full Stack Engineer Path', url: 'https://www.codecademy.com/learn/full-stack-engineer' },
            { type: 'documentation', title: 'Web.dev by Google - Learn Web Development', url: 'https://web.dev/learn' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'MDN Web Docs - Complete Reference', url: 'https://developer.mozilla.org/en-US/' },
            { type: 'video-course', title: 'The Web Developer Bootcamp 2024 - Udemy', url: 'https://www.udemy.com/course/the-web-developer-bootcamp/' },
            { type: 'practice-platform', title: 'Frontend Mentor - Real Projects', url: 'https://www.frontendmentor.io' },
            { type: 'documentation', title: 'Web Accessibility Guidelines (WCAG)', url: 'https://www.w3.org/WAI/WCAG21/quickref/' },
          ],
          advanced: [
            { type: 'official-docs', title: 'W3C Web Standards Specifications', url: 'https://www.w3.org/TR/' },
            { type: 'video-course', title: 'Advanced Web Development Patterns - Frontend Masters', url: 'https://frontendmasters.com' },
            { type: 'practice-platform', title: 'Frontend Challenges - Advanced', url: 'https://www.codementor.io/projects' },
            { type: 'github-resources', title: 'Awesome Web Development Resources', url: 'https://github.com/markodenic/web-development-resources' },
          ],
        },
        nodejs: {
          beginner: [
            { type: 'official-docs', title: 'Node.js Official Getting Started', url: 'https://nodejs.org/en/docs/guides/' },
            { type: 'video-course', title: 'Node.js Complete Course - freeCodeCamp (7 hours)', url: 'https://www.youtube.com/watch?v=Oe421DxqdiA' },
            { type: 'interactive-tutorial', title: 'The Node.js Way - Codecademy', url: 'https://www.codecademy.com/learn/learn-node-js' },
            { type: 'documentation', title: 'Express.js Beginner Guide', url: 'https://expressjs.com/en/starter/basic-routing.html' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'Node.js API Documentation', url: 'https://nodejs.org/en/docs/api/' },
            { type: 'video-course', title: 'Node.js Advanced Patterns - Frontend Masters', url: 'https://frontendmasters.com/courses/nodejs-v3/' },
            { type: 'practice-platform', title: 'Real World Node.js Applications', url: 'https://github.com/EbookFoundation/free-programming-books#nodejs' },
            { type: 'documentation', title: 'You Don\'t Know Node.js', url: 'https://github.com/azat-co/you-dont-know-node' },
          ],
          advanced: [
            { type: 'official-docs', title: 'Node.js Internals & Performance', url: 'https://nodejs.org/en/docs/guides/nodejs-performance-monitoring/' },
            { type: 'video-course', title: 'Node.js Performance & Scaling - egghead.io', url: 'https://egghead.io/courses/scaling-nodejs-applications' },
            { type: 'documentation', title: 'Microservices with Node.js', url: 'https://github.com/goldbergyoni/nodebestpractices' },
            { type: 'github-resources', title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices' },
          ],
        },
        typescript: {
          beginner: [
            { type: 'official-docs', title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/' },
            { type: 'video-course', title: 'TypeScript for Beginners - freeCodeCamp (1 hour)', url: 'https://www.youtube.com/watch?v=BwuLSPajF40' },
            { type: 'interactive-tutorial', title: 'TypeScript Playground & Tutorials', url: 'https://www.typescriptlang.org/play' },
            { type: 'documentation', title: 'Learn TypeScript Step by Step', url: 'https://www.typescriptlang.org/docs/handbook/2/basic-types.html' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'TypeScript Handbook - Advanced Types', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html' },
            { type: 'video-course', title: 'TypeScript Complete Guide - Udemy', url: 'https://www.udemy.com/course/understanding-typescript/' },
            { type: 'practice-platform', title: 'TypeScript Exercises', url: 'https://github.com/type-challenges/type-challenges' },
            { type: 'documentation', title: 'Advanced TypeScript Patterns', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' },
          ],
          advanced: [
            { type: 'official-docs', title: 'TypeScript Internals & Compiler API', url: 'https://www.typescriptlang.org/docs/handbook/compiler-options.html' },
            { type: 'video-course', title: 'Advanced TypeScript - Frontend Masters', url: 'https://frontendmasters.com/courses/typescript-practice/' },
            { type: 'practice-platform', title: 'TypeScript Type Challenges', url: 'https://github.com/type-challenges/type-challenges/blob/main/README.en.md' },
            { type: 'github-resources', title: 'Advanced TypeScript Concepts', url: 'https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md' },
          ],
        },
        sql: {
          beginner: [
            { type: 'official-docs', title: 'SQL Tutorial - W3Schools Complete', url: 'https://www.w3schools.com/sql/' },
            { type: 'video-course', title: 'SQL for Beginners - freeCodeCamp (5 hours)', url: 'https://www.youtube.com/watch?v=5OdSS3D7Qmk' },
            { type: 'interactive-tutorial', title: 'SQLiteOnline - Practice SQL', url: 'https://sqliteonline.com' },
            { type: 'practice-platform', title: 'SQLZoo Interactive Lessons', url: 'https://sqlzoo.net/wiki/SQL_Tutorial' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'PostgreSQL Official Documentation', url: 'https://www.postgresql.org/docs/' },
            { type: 'video-course', title: 'Advanced SQL - Mode Analytics', url: 'https://mode.com/sql-tutorial/advanced-sql/' },
            { type: 'practice-platform', title: 'LeetCode SQL Medium Problems', url: 'https://leetcode.com/problemset/?topicSlugs=database&difficulty=MEDIUM' },
            { type: 'documentation', title: 'SQL Window Functions Complete Guide', url: 'https://mode.com/sql-tutorial/sql-window-functions/' },
          ],
          advanced: [
            { type: 'official-docs', title: 'PostgreSQL Advanced Features', url: 'https://www.postgresql.org/docs/current/advanced.html' },
            { type: 'video-course', title: 'SQL Query Optimization & Performance Tuning', url: 'https://www.udemy.com/course/sql-and-database-design-tutorial-relational-sql-databases/' },
            { type: 'practice-platform', title: 'LeetCode SQL Hard Problems', url: 'https://leetcode.com/problemset/?topicSlugs=database&difficulty=HARD' },
            { type: 'documentation', title: 'Database Optimization Best Practices', url: 'https://use-the-index-luke.com' },
          ],
        },
        database: {
          beginner: [
            { type: 'official-docs', title: 'MongoDB Getting Started Guide', url: 'https://docs.mongodb.com/manual/introduction/' },
            { type: 'video-course', title: 'Database Design Basics - freeCodeCamp', url: 'https://www.youtube.com/watch?v=4cWkVbC2bNE' },
            { type: 'interactive-tutorial', title: 'Firebase Documentation & Guides', url: 'https://firebase.google.com/docs' },
            { type: 'documentation', title: 'Relational Database Fundamentals', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
          ],
          intermediate: [
            { type: 'official-docs', title: 'MongoDB Advanced Patterns', url: 'https://docs.mongodb.com/manual/core/data-modeling-introduction/' },
            { type: 'video-course', title: 'Database Design & Optimization Course', url: 'https://www.udemy.com/course/ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/' },
            { type: 'documentation', title: 'NoSQL vs SQL Comprehensive Guide', url: 'https://www.mongodb.com/resources/languages/nosql-vs-sql' },
            { type: 'practice-platform', title: 'Design Real Database Schemas', url: 'https://dbdiagram.io' },
          ],
          advanced: [
            { type: 'official-docs', title: 'Database Internals & Architecture', url: 'https://www.postgresql.org/docs/current/internals.html' },
            { type: 'video-course', title: 'Advanced Database Optimization', url: 'https://www.coursera.org/learn/database-design-tuning' },
            { type: 'documentation', title: 'Designing Data-Intensive Applications (Book)', url: 'https://dataintensive.net' },
            { type: 'github-resources', title: 'Database Sharding & Replication Patterns', url: 'https://github.com/donnemartin/system-design-primer' },
          ],
        },
      }

      // Get base resources for the topic
      const normalizedTopic = courseTopic.toLowerCase().trim()
      
      // FIRST CHECK: Is this a language learning topic? Use language-specific resources
      for (const [language, resources] of Object.entries(languageLearningResources)) {
        if (normalizedTopic.includes(language) || language.includes(normalizedTopic)) {
          console.log(`Using language learning resources for: ${language}`)
          return resources
        }
      }
      
      // SECOND CHECK: Look for programming/technical topics in topicResourceMap
      let topicResources = null
      
      for (const [key, resources] of Object.entries(topicResourceMap)) {
        if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
          topicResources = resources
          break
        }
      }

      // Determine user experience level (normalize)
      const userLevel =
        experience.toLowerCase().includes('beginner') ? 'beginner'
          : experience.toLowerCase().includes('intermediate') ? 'intermediate'
          : 'advanced'

      // If we have topic-specific resources, use them with the right experience level
      if (topicResources) {
        return topicResources[userLevel] || topicResources.beginner
      }

      // Fallback: Generate high-quality, REAL course resources (not search pages)
      const genericResources: Array<{ type: string; title: string; url: string }> = []
      const encodedTopic = encodeURIComponent(courseTopic)

      if (userLevel === 'beginner') {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} - GeeksforGeeks Complete Guide`,
          url: `https://www.geeksforgeeks.org/${courseTopic.toLowerCase().replace(/\s+/g, '-')}/`,
        })
        genericResources.push({
          type: 'video-course',
          title: `${courseTopic} for Beginners - freeCodeCamp`,
          url: `https://www.freecodecamp.org/news/tag/${courseTopic.toLowerCase()}/`,
        })
        genericResources.push({
          type: 'tutorial',
          title: `${courseTopic} - W3Schools Interactive Tutorial`,
          url: `https://www.w3schools.com/${courseTopic.toLowerCase().replace(/\s+/g, '')}/`,
        })
        genericResources.push({
          type: 'article',
          title: `${courseTopic} - Dev.to Tutorial Collection`,
          url: `https://dev.to/t/${courseTopic.toLowerCase().replace(/\s+/g, '-')}/latest`,
        })
      } else if (userLevel === 'intermediate') {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} - Official Documentation`,
          url: `https://www.geeksforgeeks.org/${courseTopic.toLowerCase().replace(/\s+/g, '-')}/`,
        })
        genericResources.push({
          type: 'video-course',
          title: `Advanced ${courseTopic} - Udemy Courses`,
          url: `https://www.udemy.com/courses/search/?q=${encodedTopic}`,
        })
        genericResources.push({
          type: 'practice-platform',
          title: `${courseTopic} - LeetCode Practice`,
          url: `https://leetcode.com/tag/${courseTopic.toLowerCase()}/`,
        })
        genericResources.push({
          type: 'github',
          title: `${courseTopic} - GitHub Project Examples`,
          url: `https://github.com/topics/${courseTopic.toLowerCase().replace(/\s+/g, '-')}`,
        })
      } else {
        genericResources.push({
          type: 'official-docs',
          title: `${courseTopic} - Advanced Patterns & Practices`,
          url: `https://www.geeksforgeeks.org/${courseTopic.toLowerCase().replace(/\s+/g, '-')}/advanced/`,
        })
        genericResources.push({
          type: 'video-course',
          title: `${courseTopic} - Frontend Masters Advanced Course`,
          url: `https://frontendmasters.com/courses/`,
        })
        genericResources.push({
          type: 'documentation',
          title: `${courseTopic} - System Design & Architecture`,
          url: `https://github.com/donnemartin/system-design-primer`,
        })
        genericResources.push({
          type: 'github',
          title: `${courseTopic} Design Patterns & Examples`,
          url: `https://github.com/search?q=${encodedTopic}+design+patterns`,
        })
        genericResources.push({
          type: 'article',
          title: `${courseTopic} Expert Articles & Guides`,
          url: `https://medium.com/search?q=${encodedTopic}`,
        })
      }

      return genericResources
    }

    // Extract user answers
    const userName = answers[1] || 'Student'
    const goal = answers[2] || 'general learning'
    const experience = answers[3] || 'beginner'
    const timeCommitment = answers[4] || '1-2 hours'
    const learningStyle = answers[5] || 'mixed'
    const timeline = answers[6] || '1 month'
    const interests = Array.isArray(answers[7]) ? answers[7].join(', ') : 'general topics'
    const preference = answers[8] || 'mix of both'
    const progressTracking = answers[9] || 'weekly'
    const specificFocus = answers[10] || 'comprehensive coverage'

    console.log('Extracted answers:', { userName, goal, experience, timeline, interests })

    // Determine number of modules based on timeline + depth signals
    const getModuleCount = (
      timeline: string,
      experience: string,
      goal: string,
      timeCommitment: string
    ): number => {
      const toAverageNumber = (value: string): number | null => {
        const matches = value.match(/(\d+(?:\.\d+)?)/g)
        if (!matches) return null
        const nums = matches.map(Number)
        return nums.reduce((a, b) => a + b, 0) / nums.length
      }

      const parseTimelineToWeeks = (value: string): number => {
        const normalized = value.toLowerCase()
        const avg = toAverageNumber(normalized)
        if (!avg) return 6 // fallback baseline
        if (normalized.includes('week')) return avg
        if (normalized.includes('month')) return avg * 4
        if (normalized.includes('day')) return Math.max(1, avg / 7)
        if (normalized.includes('year')) return avg * 52
        return avg >= 1 ? avg * 4 : 6
      }

      const parseHoursPerWeek = (value: string): number => {
        const normalized = value.toLowerCase()
        const avg = toAverageNumber(normalized)
        if (!avg) return 5
        if (normalized.includes('hour')) return avg
        if (normalized.includes('day')) return avg * 7
        return avg
      }

      const weeks = parseTimelineToWeeks(timeline)
      const hoursPerWeek = parseHoursPerWeek(timeCommitment)

      // Base modules scale with available weeks (roughly 1.2 modules per week plus a starter buffer)
      let modules = Math.round(weeks * 1.2 + 2)

      // Depth adjustments
      const goalLower = goal.toLowerCase()
      const experienceLower = experience.toLowerCase()
      const deepDiveSignals = ['deep', 'advance', 'expert', 'career', 'master', 'intensive']
      if (deepDiveSignals.some((signal) => goalLower.includes(signal))) modules += 2
      if (experienceLower.includes('advanced') || experienceLower.includes('intermediate')) modules += 1

      // Time commitment adjustments
      if (hoursPerWeek >= 10) modules += 2
      else if (hoursPerWeek >= 6) modules += 1
      else if (hoursPerWeek <= 3) modules -= 1

      // Clamp to a reasonable range so short courses stay short and long ones are rich but not bloated
      modules = Math.min(18, Math.max(5, modules))
      return modules
    }

    const numModules = getModuleCount(timeline, experience, goal, timeCommitment)

    // Determine topic category to generate appropriate course structure
    const topicLower = topic.toLowerCase()
    const isLanguageTopic = ['italian', 'spanish', 'french', 'german', 'portuguese', 'japanese', 'chinese', 'korean', 'russian', 'arabic', 'hindi', 'mandarin', 'french', 'dutch', 'english', 'swedish', 'norwegian'].includes(topicLower)
    const isProgrammingTopic = ['javascript', 'python', 'react', 'node', 'typescript', 'java', 'cpp', 'c++', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'groovy', 'perl', 'haskell', 'elixir', 'clojure', 'r', 'matlab', 'lua', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'].includes(topicLower)
    const isWebTopic = ['web development', 'html', 'css', 'responsive design', 'frontend', 'backend'].includes(topicLower)
    
    // Create topic-specific example modules
    let exampleModulesText = ''
    if (isLanguageTopic) {
      exampleModulesText = `EXAMPLES OF GOOD MODULE TITLES FOR LANGUAGE LEARNING:
- "Italian Greetings and Basic Phrases" ✓
- "Italian Present Tense Verbs and Conjugation" ✓  
- "Italian Food Vocabulary and Ordering at Restaurants" ✓
- "Italian Grammar: Adjectives and Nouns" ✓
- "Italian Conversation: Travel and Navigation" ✓

EXAMPLES OF BAD MODULE TITLES:
- "Introduction to Italian" ✗
- "Italian Basics" ✗
- "Italian Fundamentals" ✗

MODULE FOCUS FOR LANGUAGE:
- Each module focuses on practical conversation or grammar concepts
- Use real-world scenarios (travel, business, casual conversation)
- Include vocabulary themes with cultural context
- Include pronunciation and listening comprehension`
    } else if (isProgrammingTopic) {
      exampleModulesText = `EXAMPLES OF GOOD MODULE TITLES FOR PROGRAMMING:
- "${topic} Variables, Data Types, and Operators" ✓
- "${topic} Functions and Modules" ✓  
- "${topic} Object-Oriented Programming" ✓
- "${topic} APIs and External Libraries" ✓

EXAMPLES OF BAD MODULE TITLES:
- "Introduction to ${topic}" ✗
- "${topic} Basics" ✗
- "${topic} Fundamentals" ✗

MODULE FOCUS FOR PROGRAMMING:
- Each module covers 2-4 specific technical concepts
- Use official documentation terminology
- Include hands-on coding exercises
- Focus on applicable real-world patterns`
    } else {
      exampleModulesText = `EXAMPLES OF GOOD MODULE TITLES:
- "Foundational Concepts in ${topic}" ✓
- "${topic}: Core Principles and Applications" ✓  
- "Advanced ${topic} Techniques" ✓

EXAMPLES OF BAD MODULE TITLES:
- "Introduction to ${topic}" ✗
- "${topic} Basics" ✗`
    }

    // Build AI prompt with detailed instructions for SPECIFIC, SEARCHABLE module topics
    const prompt = `You are an expert course curriculum designer creating a professional learning path tailored to ${isLanguageTopic ? 'language learning' : isProgrammingTopic ? 'programming education' : 'technical education'}.

USER PROFILE:
- Name: ${userName}
- Primary Goal: ${goal}
- Experience Level: ${experience}
- Available Time: ${timeCommitment}
- Timeline: ${timeline}
- Topic: ${topic}

CRITICAL REQUIREMENTS FOR MODULE TITLES:
1. Create EXACTLY ${numModules} separate modules
2. Module titles MUST be SPECIFIC and SEARCHABLE (NOT vague titles like "Foundations" or "Basics")
3. Use CONCRETE terms appropriate for ${isLanguageTopic ? 'language learning' : 'technical concepts'}
4. Each module must have DISTINCT, practical topics
5. Avoid generic titles - be specific about what learners will actually study

${exampleModulesText}

MODULE STRUCTURE:
- Each module must focus on ${isLanguageTopic ? '2-3 specific vocabulary themes or grammar concepts' : '2-4 specific, searchable technical concepts'}
- Build progressively from basic to advanced
- Use terminology that matches ${isLanguageTopic ? 'language learning resources and cultural context' : 'official documentation'}}
- Ensure each module title contains keywords that will match real tutorials

For each module include:
- SPECIFIC title with concrete keywords (this is critical for resource matching!)
- Clear learning objectives using concrete terms
- Specific topics to cover (actual concepts, not generic descriptions)
- youtubeSearch: Use EXACT terms (e.g., ${isLanguageTopic ? '"Italian family vocabulary tutorial" not "Italian vocabulary"' : '"React useState Hook tutorial" not "React basics"'})
- readingMaterials: Will be auto-generated based on title keywords

RESPONSE FORMAT - Return ONLY valid JSON:
{
  "title": "Complete ${topic} Mastery Course for ${userName}",
  "description": "A comprehensive ${timeline} course covering ${topic} from fundamentals to advanced concepts. Designed for ${experience} level learners.",
  "duration": "${timeline}",
  "difficulty": "${experience}",
  "totalModules": ${numModules},
  "objectives": [
    "Master ${topic} fundamentals and core concepts",
    ${isLanguageTopic ? '"Develop practical conversation skills in ' + topic + '"' : '"Build practical applications using ' + topic + '"'},
    "Understand ${topic} best practices and patterns",
    ${isLanguageTopic ? '"Communicate confidently in real-world ' + topic + ' scenarios"' : '"Complete real-world ' + topic + ' projects"'}
  ],
  "modules": [
    {
      "id": 1,
      "title": ${isLanguageTopic ? '"' + topic + ' Greetings and Basic Phrases"' : isProgrammingTopic ? '"' + topic + ' Variables, Data Types, and Operators"' : '"Introduction to ' + topic + '"'},
      "weekNumber": 1,
      "duration": "3-5 days",
      "description": ${isLanguageTopic ? '"Learn essential ' + topic + ' greetings, introductions, and basic phrases for everyday communication"' : isProgrammingTopic ? '"Learn ' + topic + ' variables, data types, and operators for fundamental programming"' : '"Explore the foundational concepts of ' + topic + '"'},
      "objectives": [${isLanguageTopic ? '"Introduce yourself in ' + topic + '", "Use common greetings and polite expressions", "Understand basic ' + topic + ' pronunciation"' : isProgrammingTopic ? '"Understand ' + topic + ' variables and scope", "Master data types", "Learn operators"' : '"Understand core concepts of ' + topic + '"'}],
      "topics": [${isLanguageTopic ? '"Common greetings (hello, goodbye)", "Introducing yourself", "Numbers 0-10", "Basic courtesy phrases"' : isProgrammingTopic ? '"Variables and constants", "Primitive data types", "Operators", "Type conversion"' : '"Overview of ' + topic + '", "Key concepts", "Applications"'}],
      "activities": [${isLanguageTopic ? '"Listening and pronunciation", "Speaking practice", "Conversation drills", "Cultural context"' : '"Video tutorials", "Coding exercises", "Practice problems", "Mini project"'}],
      "project": ${isLanguageTopic ? '"Greetings and introductions practice"' : '"' + topic + ' practice exercises"'},
      "estimatedHours": 5,
      "youtubeSearch": ${isLanguageTopic ? '"' + topic + ' greetings and phrases for beginners"' : isProgrammingTopic ? '"' + topic + ' variables data types tutorial"' : '"' + topic + ' fundamentals tutorial"'}
    }
  ],
  "resources": [
    {"type": "official-docs", "title": "Official ${topic} Documentation", "url": "https://docs.example.com"},
    {"type": "video-course", "title": "${topic} Video Course", "url": "https://youtube.com"}
  ],
  "finalProject": {
    "title": "Complete ${topic} ${isLanguageTopic ? 'Conversation' : 'Application'}",
    "description": ${isLanguageTopic ? '"Engage in a complete conversation using learned ' + topic + ' expressions and vocabulary"' : '"Build a real-world application using all learned ' + topic + ' concepts"'},
    "duration": "1-2 weeks",
    "requirements": [${isLanguageTopic ? '"Conduct a multi-topic conversation in ' + topic + '", "Demonstrate vocabulary from all modules", "Show understanding of cultural context"' : '"Implement core ' + topic + ' features", "Follow best practices", "Complete documentation"'}]
  }
}

REMEMBER: 
- Generate ALL ${numModules} modules with SPECIFIC, SEARCHABLE titles
- Use CONCRETE ${isLanguageTopic ? 'vocabulary themes or grammar concepts' : 'technical'} terms in every module title
- NO vague or generic titles like "Basics", "Fundamentals", "Introduction"
- Think: "Would this title match a real tutorial on ${isLanguageTopic ? 'language learning sites or YouTube?' : 'GeeksforGeeks or YouTube?'}"
- For ${topic}: Create modules for actual ${isLanguageTopic ? 'conversations, vocabulary domains, and grammar concepts' : 'concepts and features'} users want to learn`

    console.log('Sending to OpenRouter...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Unfold',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: AbortSignal.timeout(180000),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Course generation failed', details: error },
        { status: 400 }
      )
    }

    const data = await response.json()
    let courseContent = data.choices?.[0]?.message?.content || ''

    // Parse JSON
    let course
    try {
      courseContent = courseContent.trim()
      if (courseContent.startsWith('```')) {
        courseContent = courseContent.replace(/```json\n?/, '').replace(/```\n?$/, '')
      }
      course = JSON.parse(courseContent.trim())
      
      // Ensure all modules have reading materials AND intelligent video recommendations
      if (course.modules && Array.isArray(course.modules)) {
        course.modules = await Promise.all(course.modules.map(async (module: any, idx: number) => {
          const moduleNum = idx + 1
          const moduleTopic = module.title || topic
          const updatedModule = {
            ...module,
          }
          
          // Always regenerate reading materials for consistency/accuracy
          updatedModule.readingMaterials = generateReadingMaterials(moduleTopic, moduleNum, experience, topic)
          
          // Get best video using VIDEO INTELLIGENCE SYSTEM
          try {
            const bestVideo = await getBestVideo(moduleTopic, topic, moduleNum, numModules)
            if (bestVideo) {
              updatedModule.youtubeSearch = bestVideo.title
              updatedModule.youtubeVideoId = bestVideo.videoId
              updatedModule.videoIntelligence = {
                videoId: bestVideo.videoId,
                title: bestVideo.title,
                channel: bestVideo.channelTitle,
                thumbnail: bestVideo.thumbnail,
                relevanceScore: (bestVideo as any).relevanceScore,
                engagementScore: (bestVideo as any).engagementScore,
                educationalScore: (bestVideo as any).educationalScore,
                finalScore: (bestVideo as any).finalScore
              }
            } else {
              // Fallback to search query if video intelligence fails
              updatedModule.youtubeSearch = generateModuleVideoSearch(moduleTopic, moduleTopic, moduleNum, numModules, topic)
            }
          } catch (error) {
            console.log(`[VIDEO INTELLIGENCE] Failed for module ${moduleNum}, using fallback search`)
            updatedModule.youtubeSearch = generateModuleVideoSearch(moduleTopic, moduleTopic, moduleNum, numModules, topic)
          }
          
          return updatedModule
        }))
      }

      // Ensure course has real, accurate resources
      if (!course.resources || !Array.isArray(course.resources) || course.resources.length === 0 || 
          (course.resources.some((r: any) => r.url?.includes('example.com') || r.url === 'https://youtube.com'))) {
        course.resources = generateCourseResources(topic, goal, experience, timeline, learningStyle)
      }
    } catch (e) {
      console.error('Parse error:', e)
      
      // Create fallback course with multiple modules
      const fallbackModules = []
      const moduleTopics = interests.split(',').map(i => i.trim())
      
      // Create 4-12 modules based on timeline with VIDEO INTELLIGENCE
      for (let i = 0; i < numModules; i++) {
        const moduleNum = i + 1
        const currentModuleTopic = moduleTopics[i % moduleTopics.length] || topic
        
        let youtubeData: any = {}
        try {
          const bestVideo = await getBestVideo(currentModuleTopic, topic, moduleNum, numModules)
          if (bestVideo) {
            youtubeData = {
              youtubeSearch: bestVideo.title,
              youtubeVideoId: bestVideo.videoId,
              videoIntelligence: {
                videoId: bestVideo.videoId,
                title: bestVideo.title,
                channel: bestVideo.channelTitle,
                thumbnail: bestVideo.thumbnail,
                finalScore: (bestVideo as any).finalScore
              }
            }
          }
        } catch (error) {
          console.log(`[VIDEO INTELLIGENCE] Fallback: using search query for module ${moduleNum}`)
        }
        
        fallbackModules.push({
          id: moduleNum,
          title: `Module ${moduleNum}: ${currentModuleTopic}`,
          weekNumber: Math.ceil(moduleNum / 2),
          duration: '3-5 days',
          description: `Deep dive into ${currentModuleTopic} - Part ${moduleNum}`,
          objectives: [
            `Master ${currentModuleTopic}`,
            `Apply concepts to real scenarios`,
          ],
          topics: [
            `${currentModuleTopic} Basics`,
            `Advanced Concepts`,
            `Best Practices`,
          ],
          activities: [
            'Video lectures',
            'Interactive exercises',
            'Case studies',
            'Hands-on practice',
            'Quizzes',
          ],
          project: `Project ${moduleNum}: Build ${currentModuleTopic} application`,
          estimatedHours: 5 + i,
          youtubeSearch: youtubeData.youtubeSearch || generateModuleVideoSearch(`Module ${moduleNum}: ${currentModuleTopic}`, currentModuleTopic, moduleNum, numModules, topic),
          youtubeVideoId: youtubeData.youtubeVideoId,
          videoIntelligence: youtubeData.videoIntelligence,
          readingMaterials: generateReadingMaterials(currentModuleTopic, moduleNum, experience, topic),
        })
      }
      
      course = {
        title: `Complete ${topic} Course for ${userName}`,
        description: `A comprehensive ${timeline} course designed to help ${userName} ${goal}. This course is divided into ${numModules} distinct modules.`,
        duration: timeline,
        difficulty: experience,
        totalModules: numModules,
        objectives: [
          `Master the fundamentals of ${topic}`,
          `Achieve: ${goal}`,
          `Build practical skills in: ${interests}`,
          `Complete real-world projects`,
        ],
        modules: fallbackModules,
        resources: generateCourseResources(topic, goal, experience, timeline, learningStyle),
        finalProject: {
          title: `Capstone Project: Complete ${topic} Application`,
          description: `Apply all learned concepts to build a real-world ${topic} project`,
          duration: '1-2 weeks',
          requirements: [
            'Use learned concepts',
            'Complete documentation',
            'Present results',
          ],
        },
      }
    }

    console.log('=== SUCCESS ===')
    console.log('Course modules count:', course.modules?.length)
    console.log('First module has reading materials:', !!course.modules?.[0]?.readingMaterials)
    if (course.modules?.[0]?.readingMaterials) {
      console.log('Reading materials count:', course.modules[0].readingMaterials.length)
    }
    return NextResponse.json({
      success: true,
      course,
      topic,
      userName,
    })
  } catch (error) {
    console.error('ERROR:', error)
    return NextResponse.json(
      { error: 'Internal error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
