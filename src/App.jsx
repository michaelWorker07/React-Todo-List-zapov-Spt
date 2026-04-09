import React, { useState, useEffect, useRef } from "react";
import "./styles.css"; 
import "./Footer.css";

const UndoTimer = ({ onUndo, duration = 5, text }) => {
  const [seconds, setSeconds] = useState(duration);
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (seconds / duration) * circumference;

  useEffect(() => {
    if (seconds <= 0) return;
    const timerId = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [seconds]);

  return (
    <div className="undo-toast" style={{
      position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
      background: '#333', color: 'white', padding: '10px 20px', borderRadius: '8px',
      display: 'flex', alignItems: 'center', gap: '15px', zIndex: 1000
    }}>
      <span className="spanTextDeleteUndoButton">Удалено: {text}</span>
      <button 
        onClick={onUndo} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          <circle cx="14" cy="14" r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" /> 
          <circle 
            cx="14" cy="14" r={radius}
            stroke="#6C63FF" strokeWidth="4" strokeLinecap="round" fill="none" 
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear' 
            }} 
          /> 
          <text 
            x="14" y="14" textAnchor="middle" dy=".3em" fill="white" fontSize="10px" fontWeight="bold"
            style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
          >
            {seconds}
          </text>
        </svg>
        <span style={{ color: '#6C63FF', fontWeight: 'bold' }}>UNDO</span>
      </button>
    </div>
  );
};

export default function App() {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('todo-data');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('todo-data', JSON.stringify(todos))
    }, [todos]);

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(() => {
        const savedSelected = localStorage.getItem('todo-filter');
        return savedSelected ? JSON.parse(savedSelected) : 'ALL';
    });

    useEffect(() => {
        localStorage.setItem('todo-filter', JSON.stringify(selected));
    }, [selected]);
    const [text, setText] = useState('');
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? JSON.parse(savedTheme) : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(isDarkTheme));
    }, [isDarkTheme]);

    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lastDeleted, setLastDeleted] = useState(null);
    const [searchTodos, setSearchTodos] = useState('');
    const [errorMsgInput, seterrorMsgInput] = useState('');
    const [isOnSwitch, setisOnSwitch] = useState(false); 
    const [isShaking, setIsShaking] = useState(false);

    const timerRef = useRef(null);

    const options = ['ALL', 'Complete', 'InComplete'];

    const handleCheckInput = () => {
        if (text.trim() === '') {
            seterrorMsgInput('Поле ввода не может быть пустым!');
        } else {
            seterrorMsgInput('');
        }
    };
    
    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
    };

   const handleToggleAndDelete = () => {
    if (todos.length === 0) {
        
        setIsShaking(true); 
        setTimeout(() => setIsShaking(false), 300);
        
    } else {
       
        setisOnSwitch(true); 
        
        setTimeout(() => {
            setTodos([]);       
            setisOnSwitch(false); 
        }, 300);
    }
};
    
    const filteredTodos = todos.filter(todo => {
        let matchesStatus = true

        if (selected === 'Complete') return todo.completed;
        if (selected === 'InComplete') return !todo.completed;

        const matchesSearch = todo.text.toLowerCase().includes(searchTodos.toLocaleLowerCase());

        return matchesStatus && matchesSearch;
    });

    const totalCount = todos.length;

    const completedCount = todos.filter(t => t.completed).length; 

    const activeCount = totalCount - completedCount;

    const toggleCheckboxTodo = (id) => {
        setTodos(todos.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
    };

    const addTodo = () => {
        if (text.trim() === '') {
            seterrorMsgInput('Поле не может быть пустым!')
            return;
    }
            const newTodo = {
                id: Date.now(), 
                text: text, 
                completed: false 
    };
            setTodos([...todos, newTodo]);
            setText('');
            seterrorMsgInput('');
            setModal(false);
        
    };

    const startEdit = (todo) => {
        setEditId(todo.id);
        setEditText(todo.text);
    };

    const saveEdit = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? {...todo, text: editText} : todo
        ));
        setEditId(null);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    };

     const deleteTodo = (id) => {
       
        const itemToDelete = todos.find(todo => todo.id === id);
        
        if (itemToDelete) {
            setLastDeleted(itemToDelete);

            setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                setLastDeleted(null);
            }, 5000);
        }
    }; 

    const undoDelete = () => {
        if (lastDeleted) {
            setTodos(prev => [...prev, lastDeleted]);
            setLastDeleted(null);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString();
    const currentYear = currentTime.getFullYear();

    useEffect(() => {
        if (modal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [modal]);

    return (
        <div className={isDarkTheme ? 'dark-theme' : 'light-theme'}>
            <div className={`app ${modal ? 'blur-content' : ''}`}>

                <div className="countersTodos">
                    <p className="counterALL"><span className="spanAllTodo">Всего задач: {totalCount}</span></p>
                    <p className="counterMake"><span className="spanMakeTodo">Активные задачи: {activeCount}</span></p>
                    <p className="counterCompleted"><span className="spanCompletedTodo">Выполненые, текущие: {completedCount}</span></p>
                </div>

                <h1 className="Title-h1">TODO-LIST</h1>

                <div className="header-div">
                    <input className="searchTodo"
                    type="text" 
                    placeholder="Search note..."
                    value={searchTodos}
                    onChange={(e) => setSearchTodos(e.target.value)}
                    />

                    <div className="custom-select-wrapper">
     
                        <div className={`select-box ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                            {selected}
                            <span  className={`arrow ${isOpen ? 'open' : ''}`}></span>
                        </div>

                        {isOpen && (
                            <div className="options-container">
                            {options
                            .filter(option =>  option !== selected)
                            .map((option) => (

                            
                                <button className="buttonsSortTodo" 
                                key={option}
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                                </button>
                                ))
                            }
                            </div>
                        )}
                        </div>
                        
                    <button className="changeThemeButton" onClick={toggleTheme}></button>

                    <label className="deleteALLtodoLabel">
                        <input type="checkbox" className="inputDeleteAllTodo"
                        checked={isOnSwitch}
                        onChange={handleToggleAndDelete}
                        />
                        <span className={`sliderSwitch ${isShaking ? 'shake' : ''}`}></span>
                    </label>


                </div>

                <div className="body-div">
    
    <ul className="todos-list">
        {filteredTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
                {editId === todo.id ? (
                    <>
                    <input value={editText} className="editInputValue"
                    onChange={(e) => setEditText(e.target.value)} 
                    />
                    <button onClick={() => saveEdit(todo.id)} className="saveButtonTodo">Save</button>
                    </>
                ) : (
                    
                <>
                <div className="todo-item__content">
                    <input 
                        className="todo-item__checkbox" 
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleCheckboxTodo(todo.id)}
                    />
                    <span className="todo-item__text" style={{ 
                        textDecoration: todo.completed ? 'line-through' : 'none'
                    }}>   
                        {todo.text}
                    </span>
                </div>

                <div className="actionsButton">
                    <button onClick={() => startEdit(todo)} className="EditTodoButton"></button>
                    <button 
                        className="deleteButtonTodo"
                        onClick={() => deleteTodo(todo.id)}
                    ></button>
                </div>
            </>
                )}
            </li> 
        ))}
    </ul>
</div>

<button className="addTodoButton" onClick={() => setModal(true)}></button>

    {lastDeleted && (
    <UndoTimer onUndo={undoDelete} duration={5} text={lastDeleted.text} />
)}

</div>

  {modal && (
    <div className="modal-overlay" onClick={() => setModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h1 className="h1WindowTodo">NEW NOTE</h1>

            <input  
                className="inputReadTodo" 
                type="text" 
                placeholder="Input your note..."
                value={text}
                onChange={(e) => {setText(e.target.value)
                if (errorMsgInput) seterrorMsgInput('');
            }}
                onKeyDown={(handleKeyDown)}
            />

            {errorMsgInput && <span style={{color: 'red'}}>{errorMsgInput}</span>}

            <button className="closeButtonWindowTodo" onClick={() => setModal(false)}>
                CANCEL
            </button>
            <button className="createNewTodoButton" onClick={addTodo}>APPLY</button>
        </div>
    </div>
)}

<footer className="footer">
    <div className="footer-content">
            
            <i>
            <p className="footer-text">
                Копирование материалов сайта запрещено.
                <br />
                Нарушение авторских прав влечет за собой уголовную ответственность.
                <br />
                © 2022 - {new Date().getFullYear()} michaelWorker07. Все права защищены.
            </p>
            </i>

            <p className="footer-time">{formattedTime}</p> 

            
    </div>
</footer>
 
    </div>

  ); 
  
} 

