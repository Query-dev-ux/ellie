import React, { useState, useEffect, useRef } from 'react';
import { useTelegram } from '../hooks/useTelegram';

// Определение типов для игрового сценария
type Option = {
  text: string;
  emoji?: string;
  response: {
    text: string;
    type: 'good' | 'bad' | 'neutral';
    score?: number;
  };
};

type Stage = {
  id: string;
  message: string;
  options: Option[];
  nextStage?: string;
};

type GameScenario = {
  stages: { [key: string]: Stage };
  initialStage: string;
  finalStage: string;
};

// Игровой сценарий
const gameScenario: GameScenario = {
  stages: {
    welcome: {
      id: 'welcome',
      message: 'Привет! Я — Ellie. Учу парней уверенно флиртовать 😘\nХочешь попробовать?',
      options: [
        {
          text: 'Начать',
          response: {
            text: 'Отлично! Приступим к уроку флирта 😏',
            type: 'good'
          }
        },
        {
          text: 'Не сейчас',
          response: {
            text: 'Ну что ж, буду ждать, когда решишься 😉',
            type: 'neutral'
          }
        }
      ],
      nextStage: 'stage1'
    },
    stage1: {
      id: 'stage1',
      message: 'Представь: я стою у бара. Что скажешь первым?',
      options: [
        {
          text: 'Привет, можно угостить тебя чем-то?',
          emoji: '🍸',
          response: {
            text: 'Классика! Скромно, но со вкусом 🍸 7/10',
            type: 'good',
            score: 7
          }
        },
        {
          text: 'Ты выглядишь опасно красиво…',
          emoji: '🔥',
          response: {
            text: 'О-о-о, дерзкий 😏 А что дальше?',
            type: 'good',
            score: 8
          }
        },
        {
          text: 'Ну привет, как дела, киска?',
          emoji: '😺',
          response: {
            text: 'Киска?.. Серьёзно? 🙄 Попробуй ещё 😅',
            type: 'bad',
            score: 3
          }
        }
      ],
      nextStage: 'stage2'
    },
    stage2: {
      id: 'stage2',
      message: 'Окей, ты пригласил меня на свидание. Куда ведёшь?',
      options: [
        {
          text: 'В уютное кафе с видом на город',
          emoji: '🌆',
          response: {
            text: 'Романтика 😍 А ты не так прост, как кажешься…',
            type: 'good',
            score: 8
          }
        },
        {
          text: 'В караоке — разорвём зал!',
          emoji: '🎤',
          response: {
            text: 'Обожаю смелых! Надеюсь, поёшь лучше, чем пишешь 😄',
            type: 'good',
            score: 7
          }
        },
        {
          text: 'Ко мне… смотреть Netflix 😉',
          emoji: '📺',
          response: {
            text: 'Ох, мы только начали, а ты уже спешишь 😉',
            type: 'bad',
            score: 4
          }
        }
      ],
      nextStage: 'stage3'
    },
    stage3: {
      id: 'stage3',
      message: 'Смотри, я делаю вид, что занята. Как привлечёшь моё внимание?',
      options: [
        {
          text: 'Улыбнусь и подойду — просто',
          emoji: '😊',
          response: {
            text: 'Хмм, прямолинейно! Но слишком очевидно. 6/10',
            type: 'neutral',
            score: 6
          }
        },
        {
          text: 'Сделаю вид, что тоже не замечаю',
          emoji: '🙈',
          response: {
            text: 'Играешь в недотрогу? Интересная тактика! 7/10',
            type: 'good',
            score: 7
          }
        },
        {
          text: 'Напишу "ты невероятна" на салфетке и передам официанту',
          emoji: '✏️',
          response: {
            text: 'Вау, это мило 😍 Ты умеешь удивить! 9/10',
            type: 'good',
            score: 9
          }
        }
      ],
      nextStage: 'final'
    },
    final: {
      id: 'final',
      message: 'Отлично! Я впечатлена твоими навыками флирта. Пора применить их в реальной жизни! 💋\n\n Время идти и познакомиться с настоящими девушками!',
      options: [],
      nextStage: ''
    }
  },
  initialStage: 'welcome',
  finalStage: 'final'
};

// Полностью новая реализация WelcomeScreen
const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Черный заблюренный фон */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(30px)',
          zIndex: 0
        }}
      />
      
      {/* Отдаленное фото девушки с закругленными краями */}
      <div 
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '85%',
          height: '70%',
          maxWidth: '400px',
          maxHeight: '550px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 1
        }}
      >
        <div 
          style={{
            backgroundImage: 'url(/ellie2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      
      {/* Название "Ellie" над фото */}
      <div
        style={{
          position: 'absolute',
          top: '2%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          backgroundColor: 'rgba(30,30,40,0.8)',
          backdropFilter: 'blur(15px)',
          padding: '10px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <p 
          style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 600,
            margin: 0,
            textAlign: 'center',
            textShadow: '0 0 4px rgba(255,255,255,0.4)'
          }}
        >
          <span style={{color: '#f9a8d4'}}>Ellie✨</span>
        </p>
      </div>
      
      {/* Затемненный блок внизу с закругленными краями */}
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          maxWidth: '400px',
          backgroundColor: 'rgba(30,30,40,0.8)',
          backdropFilter: 'blur(15px)',
          padding: '20px',
          paddingBottom: '25px',
          zIndex: 2,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <p 
          style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 500,
            marginBottom: '16px',
            textShadow: '0 0 4px rgba(255,255,255,0.4)'
          }}
        >
          Твоя <span style={{color: '#f9a8d4'}}>AI-подруга</span>: умная, красивая и всегда на связи
        </p>
        
        <button 
          onClick={onStart}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
        >
          Начать чат
        </button>
      </div>
    </div>
  );
};

// Стилизуем компонент Message для чата
const StyledMessage: React.FC<{
  text: string;
  sender: 'ellie' | 'system';
  animate?: boolean;
}> = ({ text, sender, animate = false }) => {
  return (
    <div 
      className={`flex ${sender === 'ellie' ? 'justify-start' : 'justify-end'}`}
      style={{
        marginBottom: '24px' // Увеличиваю отступ между сообщениями
      }}
    >
      {sender === 'ellie' && (
        <div className="mr-2 self-start mt-1">
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundImage: 'url(/ellie2.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>
      )}
      
      <div
        style={{
          backgroundColor: sender === 'ellie' ? 'rgba(79, 70, 229, 0.7)' : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          borderRadius: sender === 'ellie' ? '0px 20px 20px 20px' : '20px 0px 20px 20px',
          padding: '12px 16px',
          maxWidth: '75%', // Уменьшаем максимальную ширину
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: animate ? 'fadeIn 0.3s ease-out' : 'none',
          fontSize: '15px',
          lineHeight: '1.5'
        }}
      >
        {text.split('\n').map((line, i) => (
          <div key={i} style={{marginBottom: i < text.split('\n').length - 1 ? '8px' : '0'}}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

// Стилизуем компонент OptionButton
const StyledOptionButton: React.FC<{
  text: string;
  onClick: () => void;
  emoji?: string;
}> = ({ text, onClick, emoji }) => (
  <button 
    onClick={onClick}
    style={{
      width: '100%',
      marginBottom: '10px',
      padding: '14px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'white',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
  >
    {emoji && <span style={{marginRight: '10px', fontSize: '20px'}}>{emoji}</span>}
    <span>{text}</span>
  </button>
);

const FlirtGame: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>(gameScenario.initialStage);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'ellie' | 'system'; }>>([
    { text: gameScenario.stages[gameScenario.initialStage].message, sender: 'ellie' }
  ]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { tg } = useTelegram();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (currentStage === gameScenario.finalStage) {
      // Set a timeout to automatically show the final button after the message is displayed
      setTimeout(() => {
        setGameFinished(true);
      }, 1000);
    }
  }, [currentStage]);

  const handleOptionSelected = (option: Option) => {
    // Добавляем выбранный вариант как сообщение от пользователя
    const updatedMessages = [...messages];
    updatedMessages.push({ text: option.text, sender: 'system' });
    
    // Через небольшую задержку добавляем ответ от Элли
    setTimeout(() => {
      const responseMessages = [...updatedMessages];
      responseMessages.push({ text: option.response.text, sender: 'ellie' });
      setMessages(responseMessages);
      
      // Если у ответа есть score, обновляем общий счет
      if (option.response.score !== undefined) {
        setTotalScore(prev => prev + option.response.score!);
      }
      
      const stage = gameScenario.stages[currentStage];
      // Показываем кнопку "Далее" только если есть следующий этап и это не финальный этап
      if (stage.nextStage && stage.nextStage !== gameScenario.finalStage) {
        setShowNextButton(true);
      } else if (stage.nextStage === gameScenario.finalStage) {
        // Если следующий этап финальный, сразу переходим к нему
        setTimeout(() => {
          handleNextStage();
        }, 700);
      }
    }, 500);
  };

  const handleNextStage = () => {
    const stage = gameScenario.stages[currentStage];
    if (stage.nextStage) {
      setCurrentStage(stage.nextStage);
      const nextStage = gameScenario.stages[stage.nextStage];
      
      // Отправляем сообщение следующего этапа
      setMessages(prev => [...prev, { text: nextStage.message, sender: 'ellie' }]);
      setShowNextButton(false);
      
      // Если это финальный этап, сразу устанавливаем gameFinished в true
      if (stage.nextStage === gameScenario.finalStage) {
        setTimeout(() => setGameFinished(true), 500);
      }
    }
  };

  const handleOfferClick = () => {
    if (tg) {
      // Здесь должен быть ваш URL для перехода к дейтинг-сервису
      tg.openLink('https://example.com/dating');
    }
  };

  // Прогресс-бар (максимум 30 очков)
  const maxScore = 30;
  const progress = Math.min((totalScore / maxScore) * 100, 100);

  if (!showChat) {
    return <WelcomeScreen onStart={() => setShowChat(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-full relative">
      {/* Заблюренный темный фон */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(30px)',
          zIndex: 0
        }}
      />
      
      {/* Шапка с Ellie */}
      <div 
        style={{
          backgroundColor: 'rgba(30,30,40,0.8)',
          backdropFilter: 'blur(15px)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundImage: 'url(/ellie2.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div>
            <div 
              style={{
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              Ellie <span style={{color: '#f9a8d4', fontSize: '14px'}}></span>
            </div>
            <div 
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4ade80',
                  borderRadius: '50%',
                  display: 'inline-block'
                }}
              ></span>
              Онлайн
            </div>
          </div>
        </div>
        
        <div 
          style={{
            marginLeft: 'auto',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div 
            style={{
              fontSize: '12px',
              color: 'white'
            }}
          >
            Очки флирта: {totalScore}/{maxScore}
          </div>
          <div
            style={{
              width: '50px',
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(to right, #4f46e5, #8b5cf6)'
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Сообщения */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {messages.map((msg, index) => (
          <StyledMessage
            key={index}
            text={msg.text}
            sender={msg.sender}
            animate={index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Нижний блок с кнопками */}
      <div 
        style={{
          backgroundColor: 'rgba(30,30,40,0.8)',
          backdropFilter: 'blur(15px)',
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {showNextButton ? (
          <button
            onClick={handleNextStage}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
          >
            Продолжить
          </button>
        ) : gameFinished ? (
          <button
            onClick={handleOfferClick}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(to right, #4f46e5, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
          >
            Применить полученные навыки
          </button>
        ) : (
          <div>
            {gameScenario.stages[currentStage].options.map((option, index) => (
              <StyledOptionButton
                key={index}
                text={option.text}
                emoji={option.emoji}
                onClick={() => handleOptionSelected(option)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlirtGame; 