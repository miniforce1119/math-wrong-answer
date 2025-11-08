// Problems list page functionality
     2	
     3	let currentPage = 1;
     4	let currentFilters = {};
     5	
     6	document.addEventListener('DOMContentLoaded', function() {
     7	    loadProblems();
     8	    setupFilters();
     9	});
    10	
    11	// Setup filter controls
    12	function setupFilters() {
    13	    const applyBtn = document.querySelector('button[onclick="applyFilters()"]');
    14	    if (applyBtn) {
    15	        applyBtn.addEventListener('click', applyFilters);
    16	    }
    17	    
    18	    // Check URL parameters
    19	    const urlParams = new URLSearchParams(window.location.search);
    20	    const studentParam = urlParams.get('student');
    21	    if (studentParam) {
    22	        const filterStudent = document.getElementById('filterStudent');
    23	        if (filterStudent) {
    24	            filterStudent.value = studentParam;
    25	        }
    26	    }
    27	}
    28	
    29	// Apply filters
    30	async function applyFilters() {
    31	    currentPage = 1;
    32	    await loadProblems();
    33	}
    34	
    35	// Load problems list
    36	async function loadProblems() {
    37	    try {
    38	        const studentFilter = document.getElementById('filterStudent')?.value;
    39	        const difficultyFilter = document.getElementById('filterDifficulty')?.value;
    40	        const masteredFilter = document.getElementById('filterMastered')?.value;
    41	        const sortBy = document.getElementById('sortBy')?.value;
    42	        const searchInput = document.getElementById('searchInput')?.value;
    43	        
    44	        const params = {
    45	            page: currentPage,
    46	            limit: 20
    47	        };
    48	        
    49	        if (sortBy) {
    50	            params.sort = sortBy;
    51	        }
    52	        
    53	        if (searchInput) {
    54	            params.search = searchInput;
    55	        }
    56	        
    57	        const data = await fetchTableData('wrong_problems', params);
    58	        let problems = data.data || [];
    59	        
    60	        // Client-side filtering (since API doesn't support all filters)
    61	        if (studentFilter) {
    62	            problems = problems.filter(p => p.student_id === studentFilter);
    63	        }
    64	        
    65	        if (difficultyFilter) {
    66	            problems = problems.filter(p => p.difficulty === difficultyFilter);
    67	        }
    68	        
    69	        if (masteredFilter) {
    70	            const isMastered = masteredFilter === 'true';
    71	            problems = problems.filter(p => p.mastered === isMastered);
    72	        }
    73	        
    74	        // Update statistics
    75	        updateStatistics(problems);
    76	        
    77	        // Display problems
    78	        displayProblems(problems);
    79	        
    80	    } catch (error) {
    81	        console.error('Error loading problems:', error);
    82	        showNotification('문제 목록 로드 실패', 'error');
    83	    }
    84	}
    85	
    86	// Update statistics summary
    87	function updateStatistics(problems) {
    88	    document.getElementById('totalCount').textContent = problems.length;
    89	    
    90	    const monthCount = problems.filter(p => isThisMonth(p.registered_date)).length;
    91	    document.getElementById('monthCount').textContent = monthCount;
    92	    
    93	    const needReview = problems.filter(p => !p.mastered).length;
    94	    document.getElementById('needReviewCount').textContent = needReview;
    95	    
    96	    const mastered = problems.filter(p => p.mastered).length;
    97	    document.getElementById('masteredCount').textContent = mastered;
    98	}
    99	
   100	// Display problems
   101	function displayProblems(problems) {
   102	    const container = document.getElementById('problemsList');
   103	    if (!container) return;
   104	    
   105	    if (problems.length === 0) {
   106	        container.innerHTML = `
   107	            <div class="text-center py-12 bg-white rounded-lg shadow-md">
   108	                <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
   109	                <p class="text-gray-600">조건에 맞는 문제가 없습니다.</p>
   110	            </div>
   111	        `;
   112	        return;
   113	    }
   114	    
   115	    container.innerHTML = problems.map(problem => createProblemCard(problem)).join('');
   116	}
   117	
   118	// Create problem card HTML
   119	function createProblemCard(problem) {
   120	    return `
   121	        <div class="bg-white rounded-lg shadow-md p-6 problem-card">
   122	            <div class="flex items-start justify-between mb-4">
   123	                <div class="flex-1">
   124	                    <div class="flex items-center space-x-2 mb-2">
   125	                        <span class="px-3 py-1 ${problem.student_id === 'student1' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} rounded-full text-sm font-semibold">
   126	                            ${problem.student_name}
   127	                        </span>
   128	                        <span class="px-3 py-1 ${getDifficultyBadgeClass(problem.difficulty)} rounded-full text-sm font-semibold">
   129	                            난이도: ${problem.difficulty}
   130	                        </span>
   131	                        ${problem.mastered ? '<span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"><i class="fas fa-check-circle mr-1"></i>마스터</span>' : ''}
   132	                    </div>
   133	                    <h3 class="text-xl font-bold text-gray-800">${problem.subject || '수학'}</h3>
   134	                    <p class="text-gray-600">${problem.problem_type || '-'}</p>
   135	                </div>
   136	                <div class="text-right">
   137	                    <p class="text-sm text-gray-500">${formatDate(problem.solved_date)}</p>
   138	                    <p class="text-xs text-gray-400">등록: ${formatDate(problem.registered_date)}</p>
   139	                </div>
   140	            </div>
   141	            
   142	            ${problem.content ? `
   143	                <div class="mb-3">
   144	                    <p class="text-gray-700">${problem.content.substring(0, 200)}${problem.content.length > 200 ? '...' : ''}</p>
   145	                </div>
   146	            ` : ''}
   147	            
   148	            ${problem.image_url && problem.image_url.startsWith('http') ? `
   149	                <div class="mb-3">
   150	                    <img src="${problem.image_url}" class="w-full max-h-48 object-contain rounded" alt="문제">
   151	                </div>
   152	            ` : ''}
   153	            
   154	            <div class="border-t pt-3 mt-3">
   155	                <div class="flex items-center justify-between">
   156	                    <div class="flex items-center space-x-4 text-sm text-gray-600">
   157	                        <span><i class="fas fa-redo mr-1"></i>복습 ${problem.review_count || 0}회</span>
   158	                        ${problem.source ? `<span><i class="fas fa-map-marker-alt mr-1"></i>${problem.source}</span>` : ''}
   159	                    </div>
   160	                    <button onclick="viewProblemDetail('${problem.id}')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
   161	                        상세보기
   162	                    </button>
   163	                </div>
   164	            </div>
   165	        </div>
   166	    `;
   167	}
   168	
   169	// View problem detail (placeholder)
   170	function viewProblemDetail(problemId) {
   171	    showNotification('상세보기 기능은 개발 중입니다.', 'info');
   172	}
   173	
   174	// Close modal (placeholder)
   175	function closeModal() {
   176	    const modal = document.getElementById('problemModal');
   177	    if (modal) {
   178	        modal.classList.add('hidden');
   179	    }
   180	}