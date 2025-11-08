// Common JavaScript functions for Math Wrong Answer Management System
     2	
     3	// Mobile menu toggle
     4	document.addEventListener('DOMContentLoaded', function() {
     5	    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
     6	    const mobileMenu = document.getElementById('mobileMenu');
     7	    
     8	    if (mobileMenuBtn && mobileMenu) {
     9	        mobileMenuBtn.addEventListener('click', function() {
    10	            mobileMenu.classList.toggle('hidden');
    11	        });
    12	    }
    13	});
    14	
    15	// API Helper Functions
    16	const API_BASE = 'tables';
    17	
    18	// Get API configuration
    19	function getApiConfig() {
    20	    return {
    21	        apiKey: localStorage.getItem('openai_api_key') || '',
    22	        model: localStorage.getItem('ai_model') || 'gpt-4o',
    23	        autoSave: localStorage.getItem('auto_save') !== 'false',
    24	        language: localStorage.getItem('ai_language') || 'ko'
    25	    };
    26	}
    27	
    28	// Check if API key is configured
    29	function hasApiKey() {
    30	    const apiKey = localStorage.getItem('openai_api_key');
    31	    return apiKey && apiKey.length > 0;
    32	}
    33	
    34	// Fetch data from table
    35	async function fetchTableData(tableName, params = {}) {
    36	    try {
    37	        const queryParams = new URLSearchParams(params);
    38	        const response = await fetch(`${API_BASE}/${tableName}?${queryParams}`);
    39	        if (!response.ok) {
    40	            throw new Error(`HTTP error! status: ${response.status}`);
    41	        }
    42	        return await response.json();
    43	    } catch (error) {
    44	        console.error(`Error fetching ${tableName}:`, error);
    45	        throw error;
    46	    }
    47	}
    48	
    49	// Get single record
    50	async function getRecord(tableName, recordId) {
    51	    try {
    52	        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`);
    53	        if (!response.ok) {
    54	            throw new Error(`HTTP error! status: ${response.status}`);
    55	        }
    56	        return await response.json();
    57	    } catch (error) {
    58	        console.error(`Error getting record from ${tableName}:`, error);
    59	        throw error;
    60	    }
    61	}
    62	
    63	// Create new record
    64	async function createRecord(tableName, data) {
    65	    try {
    66	        const response = await fetch(`${API_BASE}/${tableName}`, {
    67	            method: 'POST',
    68	            headers: {
    69	                'Content-Type': 'application/json'
    70	            },
    71	            body: JSON.stringify(data)
    72	        });
    73	        if (!response.ok) {
    74	            throw new Error(`HTTP error! status: ${response.status}`);
    75	        }
    76	        return await response.json();
    77	    } catch (error) {
    78	        console.error(`Error creating record in ${tableName}:`, error);
    79	        throw error;
    80	    }
    81	}
    82	
    83	// Update record
    84	async function updateRecord(tableName, recordId, data) {
    85	    try {
    86	        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
    87	            method: 'PUT',
    88	            headers: {
    89	                'Content-Type': 'application/json'
    90	            },
    91	            body: JSON.stringify(data)
    92	        });
    93	        if (!response.ok) {
    94	            throw new Error(`HTTP error! status: ${response.status}`);
    95	        }
    96	        return await response.json();
    97	    } catch (error) {
    98	        console.error(`Error updating record in ${tableName}:`, error);
    99	        throw error;
   100	    }
   101	}
   102	
   103	// Partial update record
   104	async function patchRecord(tableName, recordId, data) {
   105	    try {
   106	        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
   107	            method: 'PATCH',
   108	            headers: {
   109	                'Content-Type': 'application/json'
   110	            },
   111	            body: JSON.stringify(data)
   112	        });
   113	        if (!response.ok) {
   114	            throw new Error(`HTTP error! status: ${response.status}`);
   115	        }
   116	        return await response.json();
   117	    } catch (error) {
   118	        console.error(`Error patching record in ${tableName}:`, error);
   119	        throw error;
   120	    }
   121	}
   122	
   123	// Delete record
   124	async function deleteRecord(tableName, recordId) {
   125	    try {
   126	        const response = await fetch(`${API_BASE}/${tableName}/${recordId}`, {
   127	            method: 'DELETE'
   128	        });
   129	        if (!response.ok) {
   130	            throw new Error(`HTTP error! status: ${response.status}`);
   131	        }
   132	        return true;
   133	    } catch (error) {
   134	        console.error(`Error deleting record from ${tableName}:`, error);
   135	        throw error;
   136	    }
   137	}
   138	
   139	// Utility Functions
   140	
   141	// Format date
   142	function formatDate(dateString) {
   143	    if (!dateString) return '-';
   144	    const date = new Date(dateString);
   145	    return date.toLocaleDateString('ko-KR', {
   146	        year: 'numeric',
   147	        month: 'long',
   148	        day: 'numeric'
   149	    });
   150	}
   151	
   152	// Format datetime
   153	function formatDateTime(dateString) {
   154	    if (!dateString) return '-';
   155	    const date = new Date(dateString);
   156	    return date.toLocaleString('ko-KR', {
   157	        year: 'numeric',
   158	        month: 'long',
   159	        day: 'numeric',
   160	        hour: '2-digit',
   161	        minute: '2-digit'
   162	    });
   163	}
   164	
   165	// Get difficulty badge class
   166	function getDifficultyBadgeClass(difficulty) {
   167	    switch (difficulty) {
   168	        case '상':
   169	            return 'bg-red-100 text-red-700';
   170	        case '중':
   171	            return 'bg-yellow-100 text-yellow-700';
   172	        case '하':
   173	            return 'bg-green-100 text-green-700';
   174	        default:
   175	            return 'bg-gray-100 text-gray-700';
   176	    }
   177	}
   178	
   179	// Show notification
   180	function showNotification(message, type = 'info') {
   181	    const colors = {
   182	        success: 'bg-green-500',
   183	        error: 'bg-red-500',
   184	        warning: 'bg-yellow-500',
   185	        info: 'bg-blue-500'
   186	    };
   187	    
   188	    const notification = document.createElement('div');
   189	    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 transition-opacity`;
   190	    notification.textContent = message;
   191	    
   192	    document.body.appendChild(notification);
   193	    
   194	    setTimeout(() => {
   195	        notification.style.opacity = '0';
   196	        setTimeout(() => {
   197	            document.body.removeChild(notification);
   198	        }, 300);
   199	    }, 3000);
   200	}
   201	
   202	// Navigate to problems page with filters
   203	function filterByStudent(studentId) {
   204	    window.location.href = `problems.html?student=${studentId}`;
   205	}
   206	
   207	// Generate UUID
   208	function generateUUID() {
   209	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
   210	        const r = Math.random() * 16 | 0;
   211	        const v = c === 'x' ? r : (r & 0x3 | 0x8);
   212	        return v.toString(16);
   213	    });
   214	}
   215	
   216	// Get current month problems
   217	function isThisMonth(dateString) {
   218	    if (!dateString) return false;
   219	    const date = new Date(dateString);
   220	    const now = new Date();
   221	    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
   222	}
   223	
   224	// Convert file to base64
   225	function fileToBase64(file) {
   226	    return new Promise((resolve, reject) => {
   227	        const reader = new FileReader();
   228	        reader.readAsDataURL(file);
   229	        reader.onload = () => resolve(reader.result);
   230	        reader.onerror = error => reject(error);
   231	    });
   232	}
   233	
   234	// Image URL validation
   235	function isValidImageUrl(url) {
   236	    try {
   237	        const urlObj = new URL(url);
   238	        return /\.(jpg|jpeg|png|gif|webp)$/i.test(urlObj.pathname);
   239	    } catch {
   240	        return false;
   241	    }
   242	}