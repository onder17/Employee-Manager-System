// Global variables
let employees = [];
let currentEmployeeId = null;

// API Base URL
const API_BASE_URL = '/employee';

// DOM Elements
const addEmployeeForm = document.getElementById('addEmployeeForm');
const editEmployeeForm = document.getElementById('editEmployeeForm');
const employeesList = document.getElementById('employeesList');
const searchInput = document.getElementById('searchInput');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add employee form
    addEmployeeForm.addEventListener('submit', handleAddEmployee);
    
    // Edit employee form
    editEmployeeForm.addEventListener('submit', handleEditEmployee);
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            closeModal();
            closeDeleteModal();
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            closeModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// Load all employees
async function loadEmployees() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/all`);
        
        if (!response.ok) {
            throw new Error('Çalışanlar yüklenirken hata oluştu');
        }
        
        employees = await response.json();
        renderEmployees(employees);
    } catch (error) {
        showError('Çalışanlar yüklenirken hata oluştu: ' + error.message);
    }
}

// Render employees list
function renderEmployees(employeesToRender) {
    if (employeesToRender.length === 0) {
        employeesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Henüz çalışan bulunmuyor</h3>
                <p>İlk çalışanınızı ekleyerek başlayın!</p>
            </div>
        `;
        return;
    }
    
    employeesList.innerHTML = employeesToRender.map(employee => `
        <div class="employee-card" data-id="${employee.id}">
            <div class="employee-header">
                <div class="employee-avatar">
                    ${employee.imageUrl ? 
                        `<img src="${employee.imageUrl}" alt="${employee.name}" onerror="this.parentElement.innerHTML='${getInitials(employee.name)}'">` : 
                        getInitials(employee.name)
                    }
                </div>
                <div class="employee-info">
                    <h3>${employee.name}</h3>
                    <p>${employee.jobTitle}</p>
                </div>
            </div>
            <div class="employee-details">
                <div class="employee-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${employee.email}</span>
                </div>
                <div class="employee-detail">
                    <i class="fas fa-phone"></i>
                    <span>${employee.phone}</span>
                </div>
                <div class="employee-detail">
                    <i class="fas fa-id-badge"></i>
                    <span>${employee.employeeCode}</span>
                </div>
            </div>
            <div class="employee-actions">
                <button class="btn btn-primary" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <button class="btn btn-danger" onclick="deleteEmployee(${employee.id}, '${employee.name}')">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');
}

// Get initials from name
function getInitials(name) {
    return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Handle add employee
async function handleAddEmployee(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const employeeData = {
        name: formData.get('name'),
        email: formData.get('email'),
        jobTitle: formData.get('jobTitle'),
        phone: formData.get('phone'),
        imageUrl: formData.get('imageUrl') || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
            throw new Error('Çalışan eklenirken hata oluştu');
        }
        
        const newEmployee = await response.json();
        employees.push(newEmployee);
        renderEmployees(employees);
        
        // Reset form
        event.target.reset();
        
        showSuccess('Çalışan başarıyla eklendi!');
    } catch (error) {
        showError('Çalışan eklenirken hata oluştu: ' + error.message);
    }
}

// Handle edit employee
async function handleEditEmployee(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const employeeData = {
        id: parseInt(formData.get('id')),
        name: formData.get('name'),
        email: formData.get('email'),
        jobTitle: formData.get('jobTitle'),
        phone: formData.get('phone'),
        imageUrl: formData.get('imageUrl') || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
            throw new Error('Çalışan güncellenirken hata oluştu');
        }
        
        const updatedEmployee = await response.json();
        
        // Update employee in the array
        const index = employees.findIndex(emp => emp.id === updatedEmployee.id);
        if (index !== -1) {
            employees[index] = updatedEmployee;
        }
        
        renderEmployees(employees);
        closeModal();
        
        showSuccess('Çalışan başarıyla güncellendi!');
    } catch (error) {
        showError('Çalışan güncellenirken hata oluştu: ' + error.message);
    }
}

// Edit employee modal
function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return;
    
    // Fill the form with employee data
    document.getElementById('editId').value = employee.id;
    document.getElementById('editName').value = employee.name;
    document.getElementById('editEmail').value = employee.email;
    document.getElementById('editJobTitle').value = employee.jobTitle;
    document.getElementById('editPhone').value = employee.phone;
    document.getElementById('editImageUrl').value = employee.imageUrl || '';
    
    // Show modal
    editModal.style.display = 'block';
}

// Close edit modal
function closeModal() {
    editModal.style.display = 'none';
    editEmployeeForm.reset();
}

// Delete employee
function deleteEmployee(id, name) {
    currentEmployeeId = id;
    document.getElementById('deleteEmployeeName').textContent = name;
    deleteModal.style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!currentEmployeeId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/delete/${currentEmployeeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Çalışan silinirken hata oluştu');
        }
        
        // Remove employee from array
        employees = employees.filter(emp => emp.id !== currentEmployeeId);
        renderEmployees(employees);
        
        closeDeleteModal();
        showSuccess('Çalışan başarıyla silindi!');
    } catch (error) {
        showError('Çalışan silinirken hata oluştu: ' + error.message);
    }
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
    currentEmployeeId = null;
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm === '') {
        renderEmployees(employees);
        return;
    }
    
    const filteredEmployees = employees.filter(employee => 
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.jobTitle.toLowerCase().includes(searchTerm) ||
        employee.phone.includes(searchTerm)
    );
    
    renderEmployees(filteredEmployees);
}

// Show loading state
function showLoading() {
    employeesList.innerHTML = '<div class="loading">Çalışanlar yükleniyor...</div>';
}

// Show success message
function showSuccess(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

// Add CSS animations for toast notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
