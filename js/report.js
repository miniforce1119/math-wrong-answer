// Report page - simplified version
     2	
     3	document.addEventListener('DOMContentLoaded', function() {
     4	    loadReport();
     5	});
     6	
     7	async function loadReport() {
     8	    try {
     9	        const data = await fetchTableData('wrong_problems', { limit: 1000 });
    10	        const problems = data.data || [];
    11	        
    12	        updateSummary(problems);
    13	        // Charts would be implemented here with Chart.js
    14	        
    15	    } catch (error) {
    16	        console.error('Error loading report:', error);
    17	    }
    18	}
    19	
    20	function updateSummary(problems) {
    21	    document.getElementById('summaryTotal').textContent = problems.length;
    22	    
    23	    const needReview = problems.filter(p => !p.mastered).length;
    24	    document.getElementById('summaryNeedReview').textContent = needReview;
    25	    
    26	    const mastered = problems.filter(p => p.mastered).length;
    27	    const masteryRate = problems.length > 0 ? Math.round((mastered / problems.length) * 100) : 0;
    28	    document.getElementById('summaryMasteryRate').textContent = masteryRate + '%';
    29	    
    30	    // Calculate average difficulty
    31	    const difficultyMap = { '하': 1, '중': 2, '상': 3 };
    32	    const avgDiff = problems.length > 0 ? 
    33	        problems.reduce((sum, p) => sum + (difficultyMap[p.difficulty] || 2), 0) / problems.length : 0;
    34	    const avgDiffText = avgDiff < 1.5 ? '하' : avgDiff < 2.5 ? '중' : '상';
    35	    document.getElementById('summaryAvgDifficulty').textContent = avgDiffText;
    36	}