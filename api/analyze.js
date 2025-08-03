// Vercel Serverless Function for LLM Project Analysis
// Endpoint: /api/analyze

export default async function handler(req, res) {
  // Enable CORS for LLM access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query, body } = req;
    
    if (method === 'GET') {
      // Return project metadata and analysis guide
      const projectInfo = {
        project: {
          name: "ParkingSpot",
          description: "Polish parking reservation web application",
          type: "vanilla-js-spa",
          version: "1.0.0",
          repository: "https://github.com/ecm-digital/parkingapp",
          live_url: "https://parkingapp-ojztug32q-ecm-digitals-projects.vercel.app"
        },
        analysis_endpoints: {
          project_structure: "/api/analyze?type=structure",
          code_analysis: "/api/analyze?type=code",
          security_review: "/api/analyze?type=security",
          performance_audit: "/api/analyze?type=performance",
          full_analysis: "/api/analyze?type=full"
        },
        files_available: [
          "index.html",
          "script.js", 
          "styles.css",
          "project-analysis.json",
          "LLM_ANALYSIS_GUIDE.md"
        ],
        analysis_guide: "See /api/analyze?type=guide for detailed analysis instructions"
      };

      return res.status(200).json(projectInfo);
    }

    if (method === 'POST') {
      const { analysis_type, focus_areas, output_format } = body;
      
      // Process analysis request
      const analysisResult = {
        timestamp: new Date().toISOString(),
        analysis_type: analysis_type || "general",
        focus_areas: focus_areas || ["code_quality", "security", "performance"],
        status: "analysis_ready",
        instructions: {
          step1: "Download project files from GitHub: https://github.com/ecm-digital/parkingapp",
          step2: "Read LLM_ANALYSIS_GUIDE.md for detailed analysis instructions",
          step3: "Use project-analysis.json for context and metadata",
          step4: "Focus analysis on script.js (main logic) and styles.css (UI)",
          step5: "Return findings in the specified output format"
        },
        recommended_prompts: {
          code_review: "Analyze the JavaScript code structure in script.js, identify patterns, potential bugs, and suggest improvements for maintainability and performance. Focus on the ParkingApp class and reservation management functions.",
          security_audit: "Review the application for security vulnerabilities, focusing on client-side validation, localStorage usage, and potential XSS risks. The app uses no backend authentication.",
          performance_analysis: "Evaluate DOM manipulation efficiency, CSS optimization opportunities, and JavaScript execution performance. The app is mobile-responsive and uses vanilla JS.",
          accessibility_review: "Assess accessibility compliance and suggest improvements. The app has a Polish interface and should support screen readers and keyboard navigation."
        },
        context: {
          language: "Polish interface, English code comments",
          target_users: "Polish parking facility users",
          deployment: "Vercel static hosting",
          data_storage: "localStorage only (no backend)",
          browser_support: "Modern browsers with ES6+ support"
        }
      };

      return res.status(200).json(analysisResult);
    }

    // Handle specific analysis type requests
    if (method === 'GET' && query.type) {
      const analysisType = query.type;
      
      switch (analysisType) {
        case 'guide':
          return res.status(200).json({
            analysis_guide: {
              overview: "ParkingSpot is a vanilla JavaScript parking reservation app with Polish UI",
              key_files: {
                "script.js": "~40KB of core application logic with classes: ParkingApp, ParkingSpot, Reservation, User",
                "styles.css": "~26KB of responsive CSS with custom properties and animations",
                "index.html": "Semantic HTML structure with Hotjar analytics integration"
              },
              analysis_focus: [
                "Code organization and modularity in script.js",
                "Security vulnerabilities (client-side only validation)",
                "Performance optimization opportunities",
                "Accessibility improvements needed",
                "Architecture recommendations for scalability"
              ],
              recommended_tools: [
                "Static code analysis for JavaScript",
                "CSS performance audit",
                "Accessibility testing tools",
                "Security vulnerability scanners"
              ]
            }
          });

        case 'structure':
          return res.status(200).json({
            project_structure: {
              entry_point: "index.html",
              main_logic: "script.js",
              styling: "styles.css",
              configuration: ["vercel.json", "project-analysis.json"],
              documentation: ["README.md", "LLM_ANALYSIS_GUIDE.md"],
              deployment: {
                platform: "Vercel",
                type: "static_site",
                url: "https://parkingapp-ojztug32q-ecm-digitals-projects.vercel.app"
              }
            }
          });

        case 'code':
          return res.status(200).json({
            code_analysis_points: {
              main_classes: ["ParkingApp", "ParkingSpot", "Reservation", "User"],
              key_functions: [
                "initializeApp()",
                "handleLogin()",
                "createReservation()",
                "updateParkingGrid()",
                "saveToLocalStorage()"
              ],
              patterns_to_review: [
                "Event handling and DOM manipulation",
                "Data persistence with localStorage",
                "Form validation and error handling",
                "Modal dialog management",
                "Calendar integration logic"
              ],
              potential_issues: [
                "No error boundaries for failed operations",
                "Limited input sanitization",
                "Possible memory leaks in event listeners",
                "No proper state management pattern"
              ]
            }
          });

        case 'security':
          return res.status(200).json({
            security_focus_areas: {
              high_priority: [
                "Client-side only validation",
                "localStorage data exposure",
                "No CSRF protection",
                "Potential XSS vulnerabilities"
              ],
              medium_priority: [
                "No input sanitization",
                "No authentication backend",
                "Session management in localStorage",
                "No rate limiting"
              ],
              recommendations: [
                "Implement server-side validation",
                "Add input sanitization",
                "Consider JWT tokens for authentication",
                "Implement proper session management"
              ]
            }
          });

        case 'performance':
          return res.status(200).json({
            performance_audit_areas: {
              javascript: [
                "DOM manipulation efficiency",
                "Event listener optimization",
                "Memory usage patterns",
                "Function execution time"
              ],
              css: [
                "Render blocking resources",
                "CSS specificity optimization",
                "Animation performance",
                "Mobile responsiveness"
              ],
              general: [
                "Loading time optimization",
                "Bundle size reduction",
                "Caching strategies",
                "Mobile performance"
              ]
            }
          });

        default:
          return res.status(400).json({ error: "Invalid analysis type" });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {
    console.error('Analysis API Error:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}
