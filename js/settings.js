// Settings page functionality
     2	
     3	document.addEventListener('DOMContentLoaded', function() {
     4	    loadSettings();
     5	    updateApiKeyStatus();
     6	});
     7	
     8	// Load settings from localStorage
     9	function loadSettings() {
    10	    // Load API key (partially hidden)
    11	    const apiKey = localStorage.getItem('openai_api_key') || '';
    12	    const apiKeyInput = document.getElementById('apiKeyInput');
    13	    if (apiKeyInput && apiKey) {
    14	        apiKeyInput.value = apiKey;
    15	    }
    16	    
    17	    // Load AI model
    18	    const model = localStorage.getItem('ai_model') || 'gpt-4o';
    19	    const modelSelect = document.getElementById('aiModel');
    20	    if (modelSelect) {
    21	        modelSelect.value = model;
    22	    }
    23	    
    24	    // Load auto-save setting
    25	    const autoSave = localStorage.getItem('auto_save') !== 'false';
    26	    const autoSaveCheckbox = document.getElementById('autoSave');
    27	    if (autoSaveCheckbox) {
    28	        autoSaveCheckbox.checked = autoSave;
    29	    }
    30	    
    31	    // Load language
    32	    const language = localStorage.getItem('ai_language') || 'ko';
    33	    const languageSelect = document.getElementById('aiLanguage');
    34	    if (languageSelect) {
    35	        languageSelect.value = language;
    36	    }
    37	}
    38	
    39	// Update API key status display
    40	function updateApiKeyStatus() {
    41	    const apiKey = localStorage.getItem('openai_api_key');
    42	    const statusText = document.getElementById('keyStatusText');
    43	    const statusIcon = document.getElementById('keyStatusIcon');
    44	    
    45	    if (apiKey && apiKey.length > 0) {
    46	        if (statusText) {
    47	            statusText.textContent = '설정됨 (' + apiKey.substring(0, 7) + '...)';
    48	            statusText.className = 'text-sm text-green-600 font-semibold';
    49	        }
    50	        if (statusIcon) {
    51	            statusIcon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
    52	        }
    53	    } else {
    54	        if (statusText) {
    55	            statusText.textContent = '설정되지 않음';
    56	            statusText.className = 'text-sm text-gray-600';
    57	        }
    58	        if (statusIcon) {
    59	            statusIcon.innerHTML = '<i class="fas fa-times-circle text-gray-400"></i>';
    60	        }
    61	    }
    62	}
    63	
    64	// Toggle API key visibility
    65	function toggleApiKeyVisibility() {
    66	    const input = document.getElementById('apiKeyInput');
    67	    const icon = document.getElementById('eyeIcon');
    68	    
    69	    if (input && icon) {
    70	        if (input.type === 'password') {
    71	            input.type = 'text';
    72	            icon.className = 'fas fa-eye-slash';
    73	        } else {
    74	            input.type = 'password';
    75	            icon.className = 'fas fa-eye';
    76	        }
    77	    }
    78	}
    79	
    80	// Save API key
    81	function saveApiKey() {
    82	    const apiKeyInput = document.getElementById('apiKeyInput');
    83	    const apiKey = apiKeyInput?.value.trim();
    84	    
    85	    if (!apiKey) {
    86	        showNotification('API 키를 입력해주세요.', 'warning');
    87	        return;
    88	    }
    89	    
    90	    if (!apiKey.startsWith('sk-')) {
    91	        showNotification('올바른 OpenAI API 키 형식이 아닙니다. (sk-로 시작해야 합니다)', 'error');
    92	        return;
    93	    }
    94	    
    95	    try {
    96	        localStorage.setItem('openai_api_key', apiKey);
    97	        updateApiKeyStatus();
    98	        showNotification('API 키가 저장되었습니다.', 'success');
    99	    } catch (error) {
   100	        console.error('Error saving API key:', error);
   101	        showNotification('저장 중 오류가 발생했습니다.', 'error');
   102	    }
   103	}
   104	
   105	// Test API key
   106	async function testApiKey() {
   107	    const apiKey = localStorage.getItem('openai_api_key');
   108	    
   109	    if (!apiKey) {
   110	        showNotification('먼저 API 키를 저장해주세요.', 'warning');
   111	        return;
   112	    }
   113	    
   114	    const testResult = document.getElementById('testResult');
   115	    if (testResult) {
   116	        testResult.innerHTML = `
   117	            <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
   118	                <div class="flex items-center">
   119	                    <i class="fas fa-spinner fa-spin text-blue-500 mr-3"></i>
   120	                    <p class="text-blue-700">API 연결을 테스트하고 있습니다...</p>
   121	                </div>
   122	            </div>
   123	        `;
   124	        testResult.classList.remove('hidden');
   125	    }
   126	    
   127	    try {
   128	        const response = await fetch('https://api.openai.com/v1/models', {
   129	            method: 'GET',
   130	            headers: {
   131	                'Authorization': `Bearer ${apiKey}`
   132	            }
   133	        });
   134	        
   135	        if (response.ok) {
   136	            const data = await response.json();
   137	            const hasVisionModel = data.data.some(model => model.id.includes('gpt-4'));
   138	            
   139	            if (testResult) {
   140	                testResult.innerHTML = `
   141	                    <div class="bg-green-50 border-l-4 border-green-500 p-4">
   142	                        <div class="flex items-start">
   143	                            <i class="fas fa-check-circle text-green-500 text-xl mr-3 mt-1"></i>
   144	                            <div>
   145	                                <p class="text-green-700 font-semibold mb-1">✅ API 연결 성공!</p>
   146	                                <p class="text-green-600 text-sm">OpenAI API에 정상적으로 연결되었습니다.</p>
   147	                                ${hasVisionModel ? '<p class="text-green-600 text-sm mt-1">이미지 분석 기능을 사용할 수 있습니다.</p>' : ''}
   148	                            </div>
   149	                        </div>
   150	                    </div>
   151	                `;
   152	            }
   153	            showNotification('API 연결 테스트 성공!', 'success');
   154	        } else {
   155	            const error = await response.json();
   156	            throw new Error(error.error?.message || '인증 실패');
   157	        }
   158	    } catch (error) {
   159	        console.error('API test error:', error);
   160	        if (testResult) {
   161	            testResult.innerHTML = `
   162	                <div class="bg-red-50 border-l-4 border-red-500 p-4">
   163	                    <div class="flex items-start">
   164	                        <i class="fas fa-times-circle text-red-500 text-xl mr-3 mt-1"></i>
   165	                        <div>
   166	                            <p class="text-red-700 font-semibold mb-1">❌ API 연결 실패</p>
   167	                            <p class="text-red-600 text-sm">${error.message}</p>
   168	                            <p class="text-red-600 text-sm mt-1">API 키를 확인하고 다시 시도해주세요.</p>
   169	                        </div>
   170	                    </div>
   171	                </div>
   172	            `;
   173	        }
   174	        showNotification('API 연결 실패: ' + error.message, 'error');
   175	    }
   176	}
   177	
   178	// Delete API key
   179	function deleteApiKey() {
   180	    if (confirm('정말로 API 키를 삭제하시겠습니까?')) {
   181	        localStorage.removeItem('openai_api_key');
   182	        const apiKeyInput = document.getElementById('apiKeyInput');
   183	        if (apiKeyInput) {
   184	            apiKeyInput.value = '';
   185	        }
   186	        updateApiKeyStatus();
   187	        
   188	        const testResult = document.getElementById('testResult');
   189	        if (testResult) {
   190	            testResult.classList.add('hidden');
   191	        }
   192	        
   193	        showNotification('API 키가 삭제되었습니다.', 'success');
   194	    }
   195	}
   196	
   197	// Save AI settings
   198	function saveAISettings() {
   199	    const model = document.getElementById('aiModel')?.value;
   200	    const autoSave = document.getElementById('autoSave')?.checked;
   201	    const language = document.getElementById('aiLanguage')?.value;
   202	    
   203	    if (model) {
   204	        localStorage.setItem('ai_model', model);
   205	    }
   206	    
   207	    if (autoSave !== undefined) {
   208	        localStorage.setItem('auto_save', autoSave.toString());
   209	    }
   210	    
   211	    if (language) {
   212	        localStorage.setItem('ai_language', language);
   213	    }
   214	    
   215	    showNotification('AI 설정이 저장되었습니다.', 'success');
   216	}
   217	
   218	// Export data
   219	async function exportData() {
   220	    try {
   221	        showNotification('데이터를 내보내는 중...', 'info');
   222	        
   223	        const problems = await fetchTableData('wrong_problems', { limit: 1000 });
   224	        const reviews = await fetchTableData('review_records', { limit: 1000 });
   225	        const students = await fetchTableData('students', { limit: 100 });
   226	        
   227	        const exportData = {
   228	            version: '1.0',
   229	            export_date: new Date().toISOString(),
   230	            students: students.data,
   231	            problems: problems.data,
   232	            reviews: reviews.data
   233	        };
   234	        
   235	        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
   236	        const url = URL.createObjectURL(blob);
   237	        const a = document.createElement('a');
   238	        a.href = url;
   239	        a.download = `math-wrong-answers-backup-${new Date().toISOString().split('T')[0]}.json`;
   240	        document.body.appendChild(a);
   241	        a.click();
   242	        document.body.removeChild(a);
   243	        URL.revokeObjectURL(url);
   244	        
   245	        showNotification('데이터가 성공적으로 내보내졌습니다.', 'success');
   246	    } catch (error) {
   247	        console.error('Export error:', error);
   248	        showNotification('데이터 내보내기 실패', 'error');
   249	    }
   250	}
   251	
   252	// Import data
   253	function importData() {
   254	    const input = document.createElement('input');
   255	    input.type = 'file';
   256	    input.accept = 'application/json';
   257	    
   258	    input.onchange = async (e) => {
   259	        const file = e.target.files[0];
   260	        if (!file) return;
   261	        
   262	        try {
   263	            const text = await file.text();
   264	            const data = JSON.parse(text);
   265	            
   266	            if (!data.version || !data.problems) {
   267	                throw new Error('잘못된 백업 파일 형식입니다.');
   268	            }
   269	            
   270	            if (confirm(`${data.problems.length}개의 오답 문제를 가져오시겠습니까?`)) {
   271	                showNotification('데이터를 가져오는 중...', 'info');
   272	                
   273	                // Note: This is a simplified import. In production, you'd need to handle conflicts
   274	                for (const problem of data.problems) {
   275	                    try {
   276	                        await createRecord('wrong_problems', problem);
   277	                    } catch (err) {
   278	                        console.error('Error importing problem:', err);
   279	                    }
   280	                }
   281	                
   282	                showNotification('데이터 가져오기 완료!', 'success');
   283	                setTimeout(() => location.reload(), 2000);
   284	            }
   285	        } catch (error) {
   286	            console.error('Import error:', error);
   287	            showNotification('데이터 가져오기 실패: ' + error.message, 'error');
   288	        }
   289	    };
   290	    
   291	    input.click();
   292	}
   293	
   294	// Clear all data
   295	async function clearAllData() {
   296	    const confirmation = prompt('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.\n계속하려면 "DELETE"를 입력하세요:');
   297	    
   298	    if (confirmation === 'DELETE') {
   299	        try {
   300	            showNotification('데이터를 삭제하는 중...', 'info');
   301	            
   302	            // Note: This would need backend support to clear all records
   303	            // For now, we'll just show a message
   304	            showNotification('이 기능은 현재 개발 중입니다.', 'warning');
   305	            
   306	        } catch (error) {
   307	            console.error('Clear data error:', error);
   308	            showNotification('데이터 삭제 실패', 'error');
   309	        }
   310	    }
   311	}