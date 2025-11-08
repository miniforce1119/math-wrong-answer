// AI Assistant functionality for Math Wrong Answer Management System
     2	
     3	let currentImageData = null;
     4	let chatHistory = [];
     5	
     6	// Initialize on page load
     7	document.addEventListener('DOMContentLoaded', function() {
     8	    checkApiKeyStatus();
     9	    setupDragAndDrop();
    10	    
    11	    // Set today's date as default
    12	    const today = new Date().toISOString().split('T')[0];
    13	    const dateInput = document.getElementById('solvedDate');
    14	    if (dateInput) {
    15	        dateInput.value = today;
    16	    }
    17	});
    18	
    19	// Check if API key is configured
    20	function checkApiKeyStatus() {
    21	    const apiKeyWarning = document.getElementById('apiKeyWarning');
    22	    if (apiKeyWarning) {
    23	        if (!hasApiKey()) {
    24	            apiKeyWarning.classList.remove('hidden');
    25	        } else {
    26	            apiKeyWarning.classList.add('hidden');
    27	        }
    28	    }
    29	}
    30	
    31	// Toggle AI Chat Panel
    32	function toggleAIChat() {
    33	    const panel = document.getElementById('aiChatPanel');
    34	    if (panel) {
    35	        panel.classList.toggle('hidden');
    36	        if (!panel.classList.contains('hidden') && !hasApiKey()) {
    37	            showNotification('설정에서 OpenAI API 키를 입력해주세요.', 'warning');
    38	        }
    39	    }
    40	}
    41	
    42	// Setup drag and drop for image upload
    43	function setupDragAndDrop() {
    44	    const uploadArea = document.getElementById('imageUploadArea');
    45	    if (!uploadArea) return;
    46	
    47	    uploadArea.addEventListener('dragover', (e) => {
    48	        e.preventDefault();
    49	        uploadArea.classList.add('border-purple-500', 'bg-purple-100');
    50	    });
    51	
    52	    uploadArea.addEventListener('dragleave', () => {
    53	        uploadArea.classList.remove('border-purple-500', 'bg-purple-100');
    54	    });
    55	
    56	    uploadArea.addEventListener('drop', async (e) => {
    57	        e.preventDefault();
    58	        uploadArea.classList.remove('border-purple-500', 'bg-purple-100');
    59	        
    60	        const files = e.dataTransfer.files;
    61	        if (files.length > 0 && files[0].type.startsWith('image/')) {
    62	            await handleImageFile(files[0]);
    63	        }
    64	    });
    65	}
    66	
    67	// Handle image upload
    68	async function handleImageUpload(event) {
    69	    const file = event.target.files[0];
    70	    if (file) {
    71	        await handleImageFile(file);
    72	    }
    73	}
    74	
    75	// Process uploaded image file
    76	async function handleImageFile(file) {
    77	    try {
    78	        const base64 = await fileToBase64(file);
    79	        currentImageData = base64;
    80	        
    81	        const preview = document.getElementById('uploadedImagePreview');
    82	        const previewImg = document.getElementById('previewImage');
    83	        
    84	        if (preview && previewImg) {
    85	            previewImg.src = base64;
    86	            preview.classList.remove('hidden');
    87	        }
    88	        
    89	        showNotification('이미지가 업로드되었습니다. "AI로 분석하기" 버튼을 클릭하세요.', 'success');
    90	    } catch (error) {
    91	        console.error('Error handling image:', error);
    92	        showNotification('이미지 처리 중 오류가 발생했습니다.', 'error');
    93	    }
    94	}
    95	
    96	// Analyze image with OpenAI Vision API
    97	async function analyzeImage() {
    98	    if (!currentImageData) {
    99	        showNotification('먼저 이미지를 업로드해주세요.', 'warning');
   100	        return;
   101	    }
   102	
   103	    if (!hasApiKey()) {
   104	        showNotification('설정에서 OpenAI API 키를 입력해주세요.', 'warning');
   105	        return;
   106	    }
   107	
   108	    const studentId = document.getElementById('aiStudentSelect')?.value;
   109	    if (!studentId) {
   110	        showNotification('학생을 선택해주세요.', 'warning');
   111	        return;
   112	    }
   113	
   114	    try {
   115	        addChatMessage('이미지를 분석하고 있습니다...', 'bot', true);
   116	        
   117	        const config = getApiConfig();
   118	        const analysis = await callOpenAIVision(currentImageData, config);
   119	        
   120	        addChatMessage(analysis.message, 'bot');
   121	        
   122	        // Auto-save if enabled
   123	        if (config.autoSave && analysis.problemData) {
   124	            await saveProblemToDatabase(analysis.problemData, studentId);
   125	        }
   126	        
   127	    } catch (error) {
   128	        console.error('Error analyzing image:', error);
   129	        addChatMessage('이미지 분석 중 오류가 발생했습니다: ' + error.message, 'bot');
   130	        showNotification('이미지 분석 실패. API 키를 확인해주세요.', 'error');
   131	    }
   132	}
   133	
   134	// Call OpenAI Vision API
   135	async function callOpenAIVision(imageData, config) {
   136	    const apiKey = config.apiKey;
   137	    const model = config.model;
   138	    
   139	    const prompt = config.language === 'ko' ? 
   140	        `이 이미지는 학생이 틀린 수학 문제입니다. 다음 정보를 추출해주세요:
   141	
   142	1. 문제 내용 (자세히)
   143	2. 과목/단원 (예: 방정식, 함수, 도형 등)
   144	3. 문제 유형 (예: 계산, 응용, 증명 등)
   145	4. 난이도 (상/중/하)
   146	5. 정답 (있다면)
   147	6. 이 문제를 틀렸을 가능성이 있는 이유
   148	
   149	JSON 형식으로 답변해주세요:
   150	{
   151	    "content": "문제 내용",
   152	    "subject": "과목/단원",
   153	    "problem_type": "문제 유형",
   154	    "difficulty": "상 또는 중 또는 하",
   155	    "correct_answer": "정답",
   156	    "mistake_reason": "틀린 이유 분석",
   157	    "tags": ["태그1", "태그2"]
   158	}` :
   159	        `This image shows a math problem that a student got wrong. Please extract:
   160	
   161	1. Problem content (detailed)
   162	2. Subject/Unit (e.g., equations, functions, geometry)
   163	3. Problem type (e.g., calculation, application, proof)
   164	4. Difficulty (high/medium/low)
   165	5. Correct answer (if visible)
   166	6. Possible reasons why the student might have gotten it wrong
   167	
   168	Please respond in JSON format.`;
   169	
   170	    const response = await fetch('https://api.openai.com/v1/chat/completions', {
   171	        method: 'POST',
   172	        headers: {
   173	            'Content-Type': 'application/json',
   174	            'Authorization': `Bearer ${apiKey}`
   175	        },
   176	        body: JSON.stringify({
   177	            model: model,
   178	            messages: [
   179	                {
   180	                    role: 'user',
   181	                    content: [
   182	                        {
   183	                            type: 'text',
   184	                            text: prompt
   185	                        },
   186	                        {
   187	                            type: 'image_url',
   188	                            image_url: {
   189	                                url: imageData
   190	                            }
   191	                        }
   192	                    ]
   193	                }
   194	            ],
   195	            max_tokens: 1000
   196	        })
   197	    });
   198	
   199	    if (!response.ok) {
   200	        const error = await response.json();
   201	        throw new Error(error.error?.message || 'API 호출 실패');
   202	    }
   203	
   204	    const data = await response.json();
   205	    const content = data.choices[0].message.content;
   206	    
   207	    try {
   208	        // Extract JSON from markdown code blocks if present
   209	        let jsonStr = content;
   210	        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
   211	        if (jsonMatch) {
   212	            jsonStr = jsonMatch[1];
   213	        }
   214	        
   215	        const problemData = JSON.parse(jsonStr);
   216	        
   217	        // Map difficulty if in English
   218	        if (problemData.difficulty) {
   219	            const diffMap = { 'high': '상', 'medium': '중', 'low': '하' };
   220	            problemData.difficulty = diffMap[problemData.difficulty.toLowerCase()] || problemData.difficulty;
   221	        }
   222	        
   223	        return {
   224	            message: '✅ 이미지 분석이 완료되었습니다!\n\n' +
   225	                     `📚 과목/단원: ${problemData.subject}\n` +
   226	                     `📝 문제 유형: ${problemData.problem_type}\n` +
   227	                     `📊 난이도: ${problemData.difficulty}\n` +
   228	                     `✅ 정답: ${problemData.correct_answer}\n\n` +
   229	                     `💡 틀린 이유 분석:\n${problemData.mistake_reason}`,
   230	            problemData: problemData
   231	        };
   232	    } catch (e) {
   233	        // If JSON parsing fails, return the raw content
   234	        return {
   235	            message: content,
   236	            problemData: null
   237	        };
   238	    }
   239	}
   240	
   241	// Save problem to database
   242	async function saveProblemToDatabase(problemData, studentId) {
   243	    try {
   244	        const studentName = studentId === 'student1' ? '첫째 아들' : '둘째 아들';
   245	        
   246	        const record = {
   247	            student_id: studentId,
   248	            student_name: studentName,
   249	            subject: problemData.subject || '',
   250	            problem_type: problemData.problem_type || '',
   251	            difficulty: problemData.difficulty || '중',
   252	            content: problemData.content || '',
   253	            image_url: currentImageData || '',
   254	            mistake_reason: problemData.mistake_reason || '',
   255	            correct_answer: problemData.correct_answer || '',
   256	            my_answer: '',
   257	            source: 'AI 분석',
   258	            solved_date: new Date().toISOString(),
   259	            registered_date: new Date().toISOString(),
   260	            review_count: 0,
   261	            mastered: false,
   262	            tags: problemData.tags || []
   263	        };
   264	        
   265	        await createRecord('wrong_problems', record);
   266	        
   267	        addChatMessage('✅ 오답이 데이터베이스에 저장되었습니다!', 'bot');
   268	        showNotification('오답이 성공적으로 등록되었습니다!', 'success');
   269	        
   270	        // Clear image
   271	        currentImageData = null;
   272	        const preview = document.getElementById('uploadedImagePreview');
   273	        if (preview) {
   274	            preview.classList.add('hidden');
   275	        }
   276	        
   277	    } catch (error) {
   278	        console.error('Error saving to database:', error);
   279	        addChatMessage('❌ 데이터베이스 저장 중 오류가 발생했습니다.', 'bot');
   280	        showNotification('저장 실패', 'error');
   281	    }
   282	}
   283	
   284	// Send text message
   285	async function sendMessage() {
   286	    const input = document.getElementById('chatInput');
   287	    const message = input?.value.trim();
   288	    
   289	    if (!message) return;
   290	    
   291	    if (!hasApiKey()) {
   292	        showNotification('설정에서 OpenAI API 키를 입력해주세요.', 'warning');
   293	        return;
   294	    }
   295	    
   296	    addChatMessage(message, 'user');
   297	    input.value = '';
   298	    
   299	    try {
   300	        addChatMessage('답변을 생성하고 있습니다...', 'bot', true);
   301	        
   302	        const config = getApiConfig();
   303	        const response = await callOpenAIChat(message, config);
   304	        
   305	        // Remove loading message
   306	        const messages = document.getElementById('chatMessages');
   307	        if (messages) {
   308	            const loadingMsg = messages.lastElementChild;
   309	            if (loadingMsg && loadingMsg.querySelector('.animate-pulse')) {
   310	                loadingMsg.remove();
   311	            }
   312	        }
   313	        
   314	        addChatMessage(response, 'bot');
   315	        
   316	    } catch (error) {
   317	        console.error('Error calling OpenAI:', error);
   318	        addChatMessage('오류가 발생했습니다: ' + error.message, 'bot');
   319	    }
   320	}
   321	
   322	// Call OpenAI Chat API
   323	async function callOpenAIChat(message, config) {
   324	    const apiKey = config.apiKey;
   325	    const model = config.model;
   326	    
   327	    chatHistory.push({
   328	        role: 'user',
   329	        content: message
   330	    });
   331	    
   332	    const systemPrompt = config.language === 'ko' ?
   333	        '당신은 수학 학습을 도와주는 친절한 AI 어시스턴트입니다. 학생들이 틀린 문제를 이해하고 개선할 수 있도록 도와주세요.' :
   334	        'You are a helpful AI assistant for math learning. Help students understand their mistakes and improve.';
   335	    
   336	    const response = await fetch('https://api.openai.com/v1/chat/completions', {
   337	        method: 'POST',
   338	        headers: {
   339	            'Content-Type': 'application/json',
   340	            'Authorization': `Bearer ${apiKey}`
   341	        },
   342	        body: JSON.stringify({
   343	            model: model,
   344	            messages: [
   345	                { role: 'system', content: systemPrompt },
   346	                ...chatHistory
   347	            ],
   348	            max_tokens: 500
   349	        })
   350	    });
   351	    
   352	    if (!response.ok) {
   353	        const error = await response.json();
   354	        throw new Error(error.error?.message || 'API 호출 실패');
   355	    }
   356	    
   357	    const data = await response.json();
   358	    const assistantMessage = data.choices[0].message.content;
   359	    
   360	    chatHistory.push({
   361	        role: 'assistant',
   362	        content: assistantMessage
   363	    });
   364	    
   365	    return assistantMessage;
   366	}
   367	
   368	// Add message to chat
   369	function addChatMessage(message, sender, isLoading = false) {
   370	    const messagesContainer = document.getElementById('chatMessages');
   371	    if (!messagesContainer) return;
   372	    
   373	    const messageDiv = document.createElement('div');
   374	    messageDiv.className = 'flex items-start space-x-3';
   375	    
   376	    if (sender === 'bot') {
   377	        messageDiv.innerHTML = `
   378	            <div class="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
   379	                <i class="fas fa-robot text-white text-sm"></i>
   380	            </div>
   381	            <div class="bg-white rounded-lg p-4 shadow-sm max-w-md ${isLoading ? 'animate-pulse' : ''}">
   382	                <p class="text-gray-800 whitespace-pre-wrap">${message}</p>
   383	            </div>
   384	        `;
   385	    } else {
   386	        messageDiv.innerHTML = `
   387	            <div class="flex-1"></div>
   388	            <div class="bg-purple-600 rounded-lg p-4 shadow-sm max-w-md">
   389	                <p class="text-white whitespace-pre-wrap">${message}</p>
   390	            </div>
   391	            <div class="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
   392	                <i class="fas fa-user text-white text-sm"></i>
   393	            </div>
   394	        `;
   395	    }
   396	    
   397	    messagesContainer.appendChild(messageDiv);
   398	    messagesContainer.scrollTop = messagesContainer.scrollHeight;
   399	}