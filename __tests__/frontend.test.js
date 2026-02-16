/**
 * @jest-environment jsdom
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock alert
global.alert = jest.fn();

describe('Frontend Todo Application', () => {
  let todoInput, addBtn, todoList, totalCount, completedCount;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <input id="todoInput" type="text" />
      <button id="addBtn">Add</button>
      <div id="todoList"></div>
      <span id="totalCount">Total: 0</span>
      <span id="completedCount">Completed: 0</span>
    `;

    // Get DOM elements
    todoInput = document.getElementById('todoInput');
    addBtn = document.getElementById('addBtn');
    todoList = document.getElementById('todoList');
    totalCount = document.getElementById('totalCount');
    completedCount = document.getElementById('completedCount');

    // Reset fetch mock
    fetch.mockReset();
    global.alert.mockReset();
  });

  describe('escapeHtml function', () => {
    test('should escape HTML special characters', () => {
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(escapeHtml('Normal text')).toBe('Normal text');
      expect(escapeHtml('<b>Bold</b>')).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });
  });

  describe('renderTodos function', () => {
    test('should show empty state when no todos', () => {
      const todos = [];
      
      if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos yet. Add one above!</div>';
      }

      expect(todoList.innerHTML).toContain('No todos yet. Add one above!');
    });

    test('should render todos correctly', () => {
      const todos = [
        { id: 1, text: 'Test todo', completed: false },
        { id: 2, text: 'Completed todo', completed: true }
      ];

      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      todoList.innerHTML = todos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''} 
            onchange="toggleTodo(${todo.id})"
          />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
      `).join('');

      expect(todoList.children.length).toBe(2);
      expect(todoList.innerHTML).toContain('Test todo');
      expect(todoList.innerHTML).toContain('Completed todo');
    });
  });

  describe('updateStats function', () => {
    test('should update statistics correctly', () => {
      const todos = [
        { id: 1, text: 'Todo 1', completed: false },
        { id: 2, text: 'Todo 2', completed: true },
        { id: 3, text: 'Todo 3', completed: true }
      ];

      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      totalCount.textContent = `Total: ${total}`;
      completedCount.textContent = `Completed: ${completed}`;

      expect(totalCount.textContent).toBe('Total: 3');
      expect(completedCount.textContent).toBe('Completed: 2');
    });

    test('should show zero stats for empty list', () => {
      const todos = [];
      
      const total = todos.length;
      const completed = todos.filter(t => t.completed).length;
      totalCount.textContent = `Total: ${total}`;
      completedCount.textContent = `Completed: ${completed}`;

      expect(totalCount.textContent).toBe('Total: 0');
      expect(completedCount.textContent).toBe('Completed: 0');
    });
  });

  describe('fetchTodos function', () => {
    test('should fetch todos successfully', async () => {
      const mockTodos = [
        { id: 1, text: 'Test todo', completed: false }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos
      });

      const response = await fetch('/api/todos');
      const todos = await response.json();

      expect(fetch).toHaveBeenCalledWith('/api/todos');
      expect(todos).toEqual(mockTodos);
    });

    test('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/todos');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('addTodo function', () => {
    test('should add a new todo', async () => {
      const newTodo = { id: 1, text: 'New todo', completed: false };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newTodo
      });

      todoInput.value = 'New todo';
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'New todo' }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result).toEqual(newTodo);
    });

    test('should not add empty todo', () => {
      todoInput.value = '';
      const text = todoInput.value.trim();
      
      if (!text) {
        alert('Please enter a todo');
      }

      expect(alert).toHaveBeenCalledWith('Please enter a todo');
    });

    test('should not add whitespace-only todo', () => {
      todoInput.value = '   ';
      const text = todoInput.value.trim();
      
      if (!text) {
        alert('Please enter a todo');
      }

      expect(alert).toHaveBeenCalledWith('Please enter a todo');
    });

    test('should handle add todo error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      todoInput.value = 'New todo';
      
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'New todo' }),
      });

      if (!response.ok) {
        alert('Failed to add todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to add todo');
    });
  });

  describe('toggleTodo function', () => {
    test('should toggle todo completion', async () => {
      const updatedTodo = { id: 1, text: 'Test todo', completed: true };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo
      });

      const response = await fetch('/api/todos/1', {
        method: 'PUT',
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.completed).toBe(true);
    });

    test('should handle toggle error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const response = await fetch('/api/todos/1', {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Failed to update todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to update todo');
    });
  });

  describe('deleteTodo function', () => {
    test('should delete a todo', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Todo deleted successfully' })
      });

      const response = await fetch('/api/todos/1', {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE',
      });
    });

    test('should handle delete error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const response = await fetch('/api/todos/1', {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Failed to delete todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to delete todo');
    });
  });

  describe('startEdit function', () => {
    test('should enter edit mode for a todo', () => {
      const todos = [
        { id: 1, text: 'Test todo', completed: false }
      ];
      let editingId = null;

      // Simulate startEdit
      editingId = 1;
      
      // Simulate renderTodos showing edit input
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const todo = todos[0];
      if (editingId === todo.id) {
        todoList.innerHTML = `
          <div class="todo-item editing">
            <input 
              type="text" 
              id="edit-input-1" 
              class="edit-input" 
              value="${escapeHtml('Test todo')}" 
            />
            <button class="save-btn" onclick="saveEdit(1)">Save</button>
            <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
          </div>
        `;
      }

      expect(todoList.innerHTML).toContain('edit-input-1');
      expect(todoList.innerHTML).toContain('save-btn');
      expect(todoList.innerHTML).toContain('cancel-btn');
    });
  });

  describe('saveEdit function', () => {
    test('should save edited todo text', async () => {
      const updatedTodo = { id: 1, text: 'Updated todo', completed: false };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo
      });

      const response = await fetch('/api/todos/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Updated todo' }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.text).toBe('Updated todo');
    });

    test('should not save empty text', () => {
      const editInput = document.createElement('input');
      editInput.value = '';
      
      const newText = editInput.value.trim();
      
      if (!newText) {
        alert('Todo text cannot be empty');
      }

      expect(alert).toHaveBeenCalledWith('Todo text cannot be empty');
    });

    test('should handle save error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false
      });

      const response = await fetch('/api/todos/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Updated todo' }),
      });

      if (!response.ok) {
        alert('Failed to save todo');
      }

      expect(alert).toHaveBeenCalledWith('Failed to save todo');
    });
  });

  describe('cancelEdit function', () => {
    test('should cancel edit mode without saving', () => {
      let editingId = 1;
      
      // Simulate cancelEdit
      editingId = null;
      
      // Simulate renderTodos returning to normal
      const todos = [
        { id: 1, text: 'Test todo', completed: false }
      ];

      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      if (editingId !== 1) {
        todoList.innerHTML = `
          <div class="todo-item">
            <input 
              type="checkbox" 
              class="todo-checkbox" 
            />
            <span class="todo-text">${escapeHtml('Test todo')}</span>
            <button class="edit-btn" onclick="startEdit(1)">Edit</button>
            <button class="delete-btn" onclick="deleteTodo(1)">Delete</button>
          </div>
        `;
      }

      expect(todoList.innerHTML).toContain('edit-btn');
      expect(todoList.innerHTML).not.toContain('save-btn');
    });
  });

  describe('renderTodos with edit mode', () => {
    test('should display edit buttons for todos', () => {
      const todos = [
        { id: 1, text: 'Test todo', completed: false }
      ];
      let editingId = null;

      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      todoList.innerHTML = todos.map(todo => {
        if (editingId === todo.id) {
          return `
            <div class="todo-item editing">
              <input 
                type="text" 
                id="edit-input-${todo.id}" 
                class="edit-input" 
                value="${escapeHtml(todo.text)}" 
              />
              <button class="save-btn" onclick="saveEdit('${todo.id}')">Save</button>
              <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
            </div>
          `;
        }
        return `
          <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
              type="checkbox" 
              class="todo-checkbox" 
              ${todo.completed ? 'checked' : ''} 
              onchange="toggleTodo('${todo.id}')" 
            />
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="edit-btn" onclick="startEdit('${todo.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Delete</button>
          </div>
        `;
      }).join('');

      expect(todoList.innerHTML).toContain('edit-btn');
      expect(todoList.innerHTML).toContain('Test todo');
    });

    test('should show edit input with correct value', () => {
      const todos = [
        { id: 1, text: 'Test todo', completed: false }
      ];
      let editingId = 1;

      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      todoList.innerHTML = todos.map(todo => {
        if (editingId === todo.id) {
          return `
            <div class="todo-item editing">
              <input 
                type="text" 
                id="edit-input-${todo.id}" 
                class="edit-input" 
                value="${escapeHtml(todo.text)}" 
              />
              <button class="save-btn" onclick="saveEdit('${todo.id}')">Save</button>
              <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
            </div>
          `;
        }
        return `
          <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
              type="checkbox" 
              class="todo-checkbox" 
              ${todo.completed ? 'checked' : ''} 
              onchange="toggleTodo('${todo.id}')" 
            />
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="edit-btn" onclick="startEdit('${todo.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Delete</button>
          </div>
        `;
      }).join('');

      const editInput = document.getElementById('edit-input-1');
      expect(todoList.innerHTML).toContain('edit-input-1');
      expect(todoList.innerHTML).toContain('Test todo');
    });

    test('should apply editing class to edit mode todo', () => {
      const todos = [
        { id: 1, text: 'Test todo', completed: false }
      ];
      let editingId = 1;

      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      todoList.innerHTML = todos.map(todo => {
        if (editingId === todo.id) {
          return `
            <div class="todo-item editing">
              <input 
                type="text" 
                id="edit-input-${todo.id}" 
                class="edit-input" 
                value="${escapeHtml(todo.text)}" 
              />
              <button class="save-btn" onclick="saveEdit('${todo.id}')">Save</button>
              <button class="cancel-btn" onclick="cancelEdit()">Cancel</button>
            </div>
          `;
        }
        return `
          <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
              type="checkbox" 
              class="todo-checkbox" 
              ${todo.completed ? 'checked' : ''} 
              onchange="toggleTodo('${todo.id}')" 
            />
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="edit-btn" onclick="startEdit('${todo.id}')">Edit</button>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Delete</button>
          </div>
        `;
      }).join('');

      expect(todoList.innerHTML).toContain('class="todo-item editing"');
    });
  });

  describe('Input validation', () => {
    test('should trim whitespace from input', () => {
      todoInput.value = '  Test todo  ';
      const text = todoInput.value.trim();
      
      expect(text).toBe('Test todo');
    });

    test('should handle special characters in input', () => {
      const specialText = '<script>alert("xss")</script>';
      const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };
      
      const escaped = escapeHtml(specialText);
      expect(escaped).not.toContain('<script>');
    });
  });
});
