// Dashboard functionality for index.html
     2	
     3	document.addEventListener('DOMContentLoaded', function() {
     4	    loadDashboardData();
     5	});
     6	
     7	// Load dashboard statistics
     8	async function loadDashboardData() {
     9	    try {
    10	        // Fetch all problems
    11	        const problemsData = await fetchTableData('wrong_problems', { limit: 1000 });
    12	        const problems = problemsData.data || [];
    13	        
    14	        // Calculate statistics for each student
    15	        updateStudentStats('student1', problems);
    16	        updateStudentStats('student2', problems);
    17	        
    18	        // Load recent problems
    19	        loadRecentProblems(problems);
    20	        
    21	    } catch (error) {
    22	        console.error('Error loading dashboard:', error);
    23	    }
    24	}
    25	
    26	// Update student statistics
    27	function updateStudentStats(studentId, problems) {
    28	    const studentProblems = problems.filter(p => p.student_id === studentId);
    29	    const monthProblems = studentProblems.filter(p => isThisMonth(p.registered_date));
    30	    
    31	    const totalEl = document.getElementById(`${studentId}-total`);
    32	    const monthEl = document.getElementById(`${studentId}-month`);
    33	    
    34	    if (totalEl) {
    35	        totalEl.textContent = studentProblems.length;
    36	    }
    37	    
    38	    if (monthEl) {
    39	        monthEl.textContent = monthProblems.length;
    40	    }
    41	}
    42	
    43	// Load recent problems
    44	function loadRecentProblems(problems) {
    45	    const container = document.getElementById('recentProblems');
    46	    if (!container) return;
    47	    
    48	    // Sort by registration date (newest first)
    49	    const recentProblems = problems
    50	        .sort((a, b) => new Date(b.registered_date) - new Date(a.registered_date))
    51	        .slice(0, 5);
    52	    
    53	    if (recentProblems.length === 0) {
    54	        container.innerHTML = `
    55	            <div class="text-center text-gray-500 py-8">
    56	                <i class="fas fa-inbox text-4xl mb-2"></i>
    57	                <p>등록된 오답이 없습니다.</p>
    58	                <a href="register.html" class="text-blue-600 hover:underline mt-2 inline-block">첫 오답 등록하기</a>
    59	            </div>
    60	        `;
    61	        return;
    62	    }
    63	    
    64	    container.innerHTML = recentProblems.map(problem => `
    65	        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
    66	            <div class="flex items-start justify-between mb-2">
    67	                <div class="flex-1">
    68	                    <div class="flex items-center space-x-2 mb-2">
    69	                        <span class="px-2 py-1 ${problem.student_id === 'student1' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} rounded text-xs font-semibold">
    70	                            ${problem.student_name}
    71	                        </span>
    72	                        <span class="px-2 py-1 ${getDifficultyBadgeClass(problem.difficulty)} rounded text-xs font-semibold">
    73	                            ${problem.difficulty}
    74	                        </span>
    75	                    </div>
    76	                    <h4 class="font-semibold text-gray-800">${problem.subject || '수학'}</h4>
    77	                    <p class="text-sm text-gray-600 mt-1">${problem.problem_type || '-'}</p>
    78	                </div>
    79	                <div class="text-right text-xs text-gray-500">
    80	                    ${formatDate(problem.registered_date)}
    81	                </div>
    82	            </div>
    83	            ${problem.content ? `
    84	                <p class="text-sm text-gray-700 mt-2 line-clamp-2">${problem.content.substring(0, 100)}${problem.content.length > 100 ? '...' : ''}</p>
    85	            ` : ''}
    86	            ${problem.image_url && !problem.image_url.startsWith('data:') ? `
    87	                <div class="mt-2">
    88	                    <img src="${problem.image_url}" class="w-full h-32 object-cover rounded" alt="문제 이미지">
    89	                </div>
    90	            ` : ''}
    91	            <div class="mt-3 flex items-center justify-between">
    92	                <div class="flex items-center space-x-3 text-xs text-gray-600">
    93	                    <span><i class="fas fa-redo mr-1"></i>복습 ${problem.review_count || 0}회</span>
    94	                    ${problem.mastered ? '<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>마스터</span>' : ''}
    95	                </div>
    96	                <a href="problems.html?id=${problem.id}" class="text-blue-600 hover:text-blue-800 text-sm">
    97	                    상세보기 <i class="fas fa-arrow-right ml-1"></i>
    98	                </a>
    99	            </div>
   100	        </div>
   101	    `).join('');
   102	}