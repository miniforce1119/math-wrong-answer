// Register page functionality
     2	
     3	document.addEventListener('DOMContentLoaded', function() {
     4	    // Set today's date
     5	    const today = new Date().toISOString().split('T')[0];
     6	    const dateInput = document.getElementById('solvedDate');
     7	    if (dateInput) {
     8	        dateInput.value = today;
     9	    }
    10	    
    11	    // Setup mode toggle
    12	    setupModeToggle();
    13	    
    14	    // Setup form submission
    15	    const form = document.getElementById('registerForm');
    16	    if (form) {
    17	        form.addEventListener('submit', handleSubmit);
    18	    }
    19	    
    20	    // Setup image input
    21	    const imageInput = document.getElementById('imageInput');
    22	    if (imageInput) {
    23	        imageInput.addEventListener('change', handleImageSelect);
    24	    }
    25	    
    26	    const imageUrl = document.getElementById('imageUrl');
    27	    if (imageUrl) {
    28	        imageUrl.addEventListener('input', handleImageUrl);
    29	    }
    30	});
    31	
    32	// Setup text/image mode toggle
    33	function setupModeToggle() {
    34	    const textModeBtn = document.getElementById('textModeBtn');
    35	    const imageModeBtn = document.getElementById('imageModeBtn');
    36	    const textMode = document.getElementById('textMode');
    37	    const imageMode = document.getElementById('imageMode');
    38	    
    39	    if (textModeBtn) {
    40	        textModeBtn.addEventListener('click', () => {
    41	            textMode?.classList.remove('hidden');
    42	            imageMode?.classList.add('hidden');
    43	            textModeBtn.classList.add('bg-blue-600', 'text-white');
    44	            textModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    45	            imageModeBtn?.classList.remove('bg-blue-600', 'text-white');
    46	            imageModeBtn?.classList.add('bg-gray-200', 'text-gray-700');
    47	        });
    48	    }
    49	    
    50	    if (imageModeBtn) {
    51	        imageModeBtn.addEventListener('click', () => {
    52	            imageMode?.classList.remove('hidden');
    53	            textMode?.classList.add('hidden');
    54	            imageModeBtn.classList.add('bg-blue-600', 'text-white');
    55	            imageModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    56	            textModeBtn?.classList.remove('bg-blue-600', 'text-white');
    57	            textModeBtn?.classList.add('bg-gray-200', 'text-gray-700');
    58	        });
    59	    }
    60	}
    61	
    62	// Handle image file selection
    63	async function handleImageSelect(event) {
    64	    const file = event.target.files[0];
    65	    if (file) {
    66	        try {
    67	            const base64 = await fileToBase64(file);
    68	            showImagePreview(base64);
    69	        } catch (error) {
    70	            console.error('Error loading image:', error);
    71	            showNotification('이미지 로드 실패', 'error');
    72	        }
    73	    }
    74	}
    75	
    76	// Handle image URL input
    77	function handleImageUrl(event) {
    78	    const url = event.target.value.trim();
    79	    if (url && isValidImageUrl(url)) {
    80	        showImagePreview(url);
    81	    }
    82	}
    83	
    84	// Show image preview
    85	function showImagePreview(src) {
    86	    const preview = document.getElementById('imagePreview');
    87	    const img = document.getElementById('previewImg');
    88	    
    89	    if (preview && img) {
    90	        img.src = src;
    91	        preview.classList.remove('hidden');
    92	    }
    93	}
    94	
    95	// Handle form submission
    96	async function handleSubmit(event) {
    97	    event.preventDefault();
    98	    
    99	    const studentId = document.getElementById('studentId')?.value;
   100	    const solvedDate = document.getElementById('solvedDate')?.value;
   101	    const subject = document.getElementById('subject')?.value;
   102	    const problemType = document.getElementById('problemType')?.value;
   103	    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value;
   104	    const source = document.getElementById('source')?.value;
   105	    const content = document.getElementById('content')?.value;
   106	    const myAnswer = document.getElementById('myAnswer')?.value;
   107	    const correctAnswer = document.getElementById('correctAnswer')?.value;
   108	    const mistakeReason = document.getElementById('mistakeReason')?.value;
   109	    const tagsInput = document.getElementById('tags')?.value;
   110	    
   111	    // Get image
   112	    let imageUrl = '';
   113	    const imageMode = document.getElementById('imageMode');
   114	    if (imageMode && !imageMode.classList.contains('hidden')) {
   115	        const previewImg = document.getElementById('previewImg');
   116	        imageUrl = previewImg?.src || '';
   117	    }
   118	    
   119	    // Parse tags
   120	    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
   121	    
   122	    // Get student name
   123	    const studentName = studentId === 'student1' ? '첫째 아들' : '둘째 아들';
   124	    
   125	    // Create record
   126	    const data = {
   127	        student_id: studentId,
   128	        student_name: studentName,
   129	        subject: subject,
   130	        problem_type: problemType,
   131	        difficulty: difficulty,
   132	        content: content,
   133	        image_url: imageUrl,
   134	        mistake_reason: mistakeReason,
   135	        correct_answer: correctAnswer,
   136	        my_answer: myAnswer,
   137	        source: source,
   138	        solved_date: solvedDate ? new Date(solvedDate).toISOString() : new Date().toISOString(),
   139	        registered_date: new Date().toISOString(),
   140	        review_count: 0,
   141	        mastered: false,
   142	        tags: tags
   143	    };
   144	    
   145	    try {
   146	        await createRecord('wrong_problems', data);
   147	        showNotification('오답이 등록되었습니다!', 'success');
   148	        
   149	        // Redirect to problems page after 1 second
   150	        setTimeout(() => {
   151	            window.location.href = 'problems.html';
   152	        }, 1000);
   153	        
   154	    } catch (error) {
   155	        console.error('Error creating problem:', error);
   156	        showNotification('등록 실패', 'error');
   157	    }
   158	}