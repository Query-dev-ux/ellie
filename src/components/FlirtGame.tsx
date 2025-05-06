import React, { useState, useEffect, useRef } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import WelcomeScreen from './WelcomeScreen';
import StyledMessage from './StyledMessage';
import StyledOptionButton from './StyledOptionButton';

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

  // Удаляем проблемную функцию скроллинга
  
  // Убираем все эффекты скроллинга, они только мешают
  useEffect(() => {
    if (currentStage === gameScenario.finalStage) {
      // Set a timeout to automatically show the final button after the message is displayed
      setTimeout(() => {
        setGameFinished(true);
      }, 1000);
    }
  }, [currentStage]);

  // Эффект для расширения окна Telegram при открытии чата
  useEffect(() => {
    if (showChat && tg) {
      // Расширяем окно Telegram WebApp на весь экран
      tg.expand();
    }
  }, [showChat, tg]);

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
    <div className="flex flex-col h-[100dvh] w-full relative overflow-hidden flex-shrink-0 flex-grow-0">
      {/* Заблюренный темный фон */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-xl z-0"
      />
      
      {/* Шапка с Ellie */}
      <div 
        className="bg-[rgba(30,30,40,0.9)] backdrop-blur-md p-3 flex items-center border-b border-white/10 fixed top-0 left-0 right-0 z-30 flex-shrink-0"
      >
        <div 
          className="flex items-center gap-2"
        >
          <div 
            className="w-8 h-8 rounded-full border border-white/20 bg-cover bg-center"
            style={{backgroundImage: 'url(/images/ellie.png)'}}
          />
          <div>
            <div 
              className="font-bold text-white text-sm flex items-center gap-1"
            >
              Ellie <span className="text-pink-300 text-xs"></span>
            </div>
            <div 
              className="text-[10px] text-white/60 flex items-center gap-1"
            >
              <span 
                className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"
              ></span>
              Онлайн
            </div>
          </div>
        </div>
        
        <div 
          className="ml-auto text-white flex items-center gap-2"
        >
          <div 
            className="text-[10px] text-white"
          >
            Очки: {totalScore}/{maxScore}
          </div>
          <div
            className="w-10 h-1 bg-white/20 rounded-sm overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500"
              style={{width: `${progress}%`}}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Полностью перестроенная структура чата и кнопок */}
      <div className="flex flex-col h-full pt-14">
        {/* Сообщения - теперь в фиксированной области с ограниченной высотой */}
        <div className="p-3 overflow-y-auto" style={{ height: "calc(100vh - 180px)" }}>
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
        
        {/* Нижний блок с кнопками - всегда внизу */}
        <div className="bg-[rgba(30,30,40,0.95)] backdrop-blur-md p-4 pb-6 border-t border-white/10 mt-auto">
          {showNextButton ? (
            <button
              onClick={handleNextStage}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-500 text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-lg transition-all duration-200"
            >
              Продолжить
            </button>
          ) : gameFinished ? (
            <button
              onClick={handleOfferClick}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-500 text-white border-none rounded-xl text-sm font-bold cursor-pointer shadow-lg transition-all duration-200"
            >
              Применить полученные навыки
            </button>
          ) : (
            <div className="space-y-1.5">
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
    </div>
  );
};

export default FlirtGame; 