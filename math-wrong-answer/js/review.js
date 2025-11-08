// Review page - simplified version
     2	
     3	let reviewProblems = [];
     4	let currentIndex = 0;
     5	let reviewResults = { correct: 0, partial: 0, wrong: 0 };
     6	
     7	async function startReview(mode) {
     8	    const studentId = document.getElementById('reviewStudent')?.value;
     9	    if (!studentId) {
    10	        showNotification('학생을 선택해주세요.', 'warning');
    11	        return;
    12	    }
    13	    
    14	    try {
    15	        const data = await fetchTableData('wrong_problems', { limit: 1000 });
    16	        let problems = data.data.filter(p => p.student_id === studentId && !p.mastered);
    17	        
    18	        if (mode === 'difficult') {
    19	            problems = problems.filter(p => p.difficulty === '상');
    20	        } else if (mode === 'random') {
    21	            problems = problems.sort(() => Math.random() - 0.5);
    22	        }
    23	        
    24	        const count = parseInt(document.getElementById('reviewCount')?.value || 10);
    25	        reviewProblems = problems.slice(0, count);
    26	        
    27	        if (reviewProblems.length === 0) {
    28	            showNotification('복습할 문제가 없습니다.', 'info');
    29	            return;
    30	        }
    31	        
    32	        document.getElementById('modeSelection').classList.add('hidden');
    33	        document.getElementById('reviewSession').classList.remove('hidden');
    34	        
    35	        currentIndex = 0;
    36	        reviewResults = { correct: 0, partial: 0, wrong: 0 };
    37	        
    38	        showProblem();
    39	        
    40	    } catch (error) {
    41	        console.error('Error starting review:', error);
    42	        showNotification('복습 시작 실패', 'error');
    43	    }
    44	}
    45	
    46	function showProblem() {
    47	    if (currentIndex >= reviewProblems.length) {
    48	        completeReview();
    49	        return;
    50	    }
    51	    
    52	    const problem = reviewProblems[currentIndex];
    53	    
    54	    document.getElementById('currentProblemNum').textContent = currentIndex + 1;
    55	    document.getElementById('totalProblemsNum').textContent = reviewProblems.length;
    56	    
    57	    const progress = ((currentIndex + 1) / reviewProblems.length) * 100;
    58	    document.getElementById('progressBar').style.width = progress + '%';
    59	    
    60	    document.getElementById('problemSubject').textContent = problem.subject || '수학';
    61	    document.getElementById('problemDifficulty').textContent = '난이도: ' + problem.difficulty;
    62	    document.getElementById('problemDifficulty').className = `px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyBadgeClass(problem.difficulty)}`;
    63	    
    64	    document.getElementById('problemContent').textContent = problem.content || '이미지 문제';
    65	    
    66	    if (problem.image_url && problem.image_url.startsWith('http')) {
    67	        document.getElementById('problemImage').classList.remove('hidden');
    68	        document.getElementById('problemImageSrc').src = problem.image_url;
    69	    } else {
    70	        document.getElementById('problemImage').classList.add('hidden');
    71	    }
    72	    
    73	    document.getElementById('userAnswer').value = '';
    74	    document.getElementById('answerSection').classList.add('hidden');
    75	    document.getElementById('showAnswerBtn').classList.remove('hidden');
    76	}
    77	
    78	function showAnswer() {
    79	    const problem = reviewProblems[currentIndex];
    80	    
    81	    document.getElementById('correctAnswerText').textContent = problem.correct_answer || '정답 정보 없음';
    82	    document.getElementById('mistakeReasonText').textContent = problem.mistake_reason || '분석 정보 없음';
    83	    
    84	    document.getElementById('answerSection').classList.remove('hidden');
    85	    document.getElementById('showAnswerBtn').classList.add('hidden');
    86	}
    87	
    88	async function submitReview(result) {
    89	    reviewResults[result === '정답' ? 'correct' : result === '부분정답' ? 'partial' : 'wrong']++;
    90	    
    91	    const problem = reviewProblems[currentIndex];
    92	    const notes = document.getElementById('reviewNotes')?.value || '';
    93	    
    94	    try {
    95	        // Update problem review count
    96	        await patchRecord('wrong_problems', problem.id, {
    97	            review_count: (problem.review_count || 0) + 1,
    98	            last_review_date: new Date().toISOString(),
    99	            mastered: result === '정답'
   100	        });
   101	        
   102	        // Create review record
   103	        await createRecord('review_records', {
   104	            problem_id: problem.id,
   105	            student_id: problem.student_id,
   106	            review_date: new Date().toISOString(),
   107	            result: result,
   108	            notes: notes
   109	        });
   110	        
   111	    } catch (error) {
   112	        console.error('Error saving review:', error);
   113	    }
   114	    
   115	    currentIndex++;
   116	    showProblem();
   117	}
   118	
   119	function completeReview() {
   120	    document.getElementById('reviewSession').classList.add('hidden');
   121	    document.getElementById('reviewComplete').classList.remove('hidden');
   122	    
   123	    document.getElementById('resultCorrect').textContent = reviewResults.correct;
   124	    document.getElementById('resultPartial').textContent = reviewResults.partial;
   125	    document.getElementById('resultWrong').textContent = reviewResults.wrong;
   126	}
   127	
   128	function exitReview() {
   129	    if (confirm('복습을 종료하시겠습니까?')) {
   130	        location.reload();
   131	    }
   132	}