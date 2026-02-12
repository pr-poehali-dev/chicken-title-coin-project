import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'profile' | 'titles' | 'quests' | 'chat' | 'admin';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [coins, setCoins] = useState(100);
  const [timeSpent, setTimeSpent] = useState(0);
  const [purchasedTitles, setPurchasedTitles] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: Array<{ id: Page; label: string; icon: string }> = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
    { id: 'titles', label: 'Титулы', icon: 'Award' },
    { id: 'quests', label: 'Квесты', icon: 'Target' },
    { id: 'chat', label: 'Чат', icon: 'MessageCircle' },
    { id: 'admin', label: 'Админ', icon: 'Settings' },
  ];

  const titles = [
    { name: '[NEWBIE]', price: 0, description: 'Начальный титул', color: 'text-gray-400' },
    { name: '[VIP]', price: 500, description: 'Твой второй титул будет, да?', color: 'text-neon-purple' },
    { name: '[ADMIN]', price: 1000, description: 'Администратор', color: 'text-red-500' },
    { name: '[SNIPER]', price: 750, description: 'Снайпер', color: 'text-neon-cyan' },
    { name: '[LEGEND]', price: 2000, description: 'Легенда', color: 'text-yellow-400' },
    { name: '[KING]', price: 3000, description: 'Король', color: 'text-neon-pink' },
    { name: '[TASK-MASTER]', price: 1500, description: 'Мастер заданий', color: 'text-green-400' },
    { name: '[CHEATER]', price: 999, description: 'Читер', color: 'text-purple-400' },
    { name: '[CREATOR]', price: 5000, description: 'Создатель', color: 'text-orange-400' },
    { name: '[COLLAB]', price: 1200, description: 'Коллаборация', color: 'text-blue-400' },
    { name: '[SAF ADMIN]', price: 2500, description: 'Крак', color: 'text-red-600' },
    { name: '[SAT ADMIN]', price: 2500, description: 'No_Texture', color: 'text-cyan-400' },
    { name: '[TROLLER]', price: 666, description: 'Тролль', color: 'text-pink-400' },
    { name: '[Третий]', price: 0, description: 'Эксклюзивный титул за 3 дня', color: 'text-amber-500' },
    { name: '[Ежедневный]', price: 0, description: 'Эксклюзивный титул за 7 дней', color: 'text-emerald-500' },
  ];

  const quests = [
    { id: 1, title: 'Провести 15 минут на сайте', reward: 50, completed: timeSpent >= 900, progress: Math.min(100, (timeSpent / 900) * 100) },
    { id: 2, title: 'Отправить первое сообщение в чате', reward: 25, completed: false, progress: 0 },
    { id: 3, title: 'Купить первый титул', reward: 100, completed: purchasedTitles.length > 0, progress: purchasedTitles.length > 0 ? 100 : 0 },
    { id: 4, title: 'Провести 1 час на сайте', reward: 200, completed: timeSpent >= 3600, progress: Math.min(100, (timeSpent / 3600) * 100) },
    { id: 5, title: 'Отправить 10 сообщений', reward: 150, completed: false, progress: 0 },
    { id: 6, title: 'Купить 3 титула', reward: 300, completed: purchasedTitles.length >= 3, progress: Math.min(100, (purchasedTitles.length / 3) * 100) },
    { id: 7, title: 'Провести 3 часа на сайте', reward: 500, completed: timeSpent >= 10800, progress: Math.min(100, (timeSpent / 10800) * 100) },
    { id: 8, title: 'Купить легендарный титул', reward: 1000, completed: false, progress: 0 },
    { id: 9, title: 'Собрать 5000 ТитулКоинов', reward: 2000, completed: coins >= 5000, progress: Math.min(100, (coins / 5000) * 100) },
    { id: 10, title: 'Провести 24 часа на сайте', reward: 5000, completed: timeSpent >= 86400, progress: Math.min(100, (timeSpent / 86400) * 100) },
  ];

  const handleBuyTitle = (title: typeof titles[0]) => {
    if (coins >= title.price && !purchasedTitles.includes(title.name)) {
      if (confirm(`Вы хотите приобрести этот титул? ${title.name}`)) {
        setCoins(prev => prev - title.price);
        setPurchasedTitles(prev => [...prev, title.name]);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}ч ${m}м ${s}с`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      
      <div className="fixed top-10 left-10 text-6xl animate-float opacity-30 pointer-events-none">👑</div>
      <div className="fixed top-40 right-20 text-5xl animate-float opacity-30 pointer-events-none" style={{animationDelay: '0.5s'}}>⭐</div>
      <div className="fixed bottom-20 left-20 text-6xl animate-float opacity-30 pointer-events-none" style={{animationDelay: '1s'}}>🏆</div>
      <div className="fixed bottom-40 right-40 text-5xl animate-float opacity-30 pointer-events-none" style={{animationDelay: '1.5s'}}>💎</div>
      <div className="fixed top-1/2 left-1/4 text-4xl animate-float opacity-30 pointer-events-none" style={{animationDelay: '2s'}}>🎯</div>

      <nav className="border-b border-border/50 backdrop-blur-xl bg-card/50 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold neon-glow">ЧикенТитул</h1>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  onClick={() => setCurrentPage(item.id)}
                  className={`${currentPage === item.id ? 'neon-border' : ''} text-xs sm:text-sm px-2 sm:px-4`}
                  size="sm"
                >
                  <Icon name={item.icon} className="sm:mr-2" size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge className="neon-border-cyan px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg">
                <Icon name="Coins" className="mr-1 sm:mr-2" size={16} />
                {coins} TC
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        {currentPage === 'home' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold neon-glow animate-neon-pulse">ЧикенТитул</h2>
              <p className="text-sm sm:text-lg md:text-xl text-muted-foreground px-4">Зарабатывай ТитулКоины, покупай уникальные титулы и выполняй квесты!</p>
              <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 flex-wrap">
                <Card className="p-3 sm:p-6 neon-border-cyan min-w-[100px]">
                  <div className="text-2xl sm:text-4xl font-bold text-neon-cyan">{coins}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">ТитулКоинов</div>
                </Card>
                <Card className="p-3 sm:p-6 neon-border-pink min-w-[100px]">
                  <div className="text-2xl sm:text-4xl font-bold text-neon-pink">{purchasedTitles.length}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Титулов</div>
                </Card>
                <Card className="p-3 sm:p-6 neon-border min-w-[100px]">
                  <div className="text-2xl sm:text-4xl font-bold text-neon-purple">{formatTime(timeSpent)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">На сайте</div>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6 hover:neon-border transition-all cursor-pointer" onClick={() => setCurrentPage('titles')}>
                <Icon name="Award" className="text-neon-purple mb-3 sm:mb-4" size={40} />
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Титулы</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Покупай уникальные титулы за ТитулКоины</p>
              </Card>
              <Card className="p-4 sm:p-6 hover:neon-border-cyan transition-all cursor-pointer" onClick={() => setCurrentPage('quests')}>
                <Icon name="Target" className="text-neon-cyan mb-3 sm:mb-4" size={40} />
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Квесты</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Выполняй задания и получай награды</p>
              </Card>
              <Card className="p-6 hover:neon-border-pink transition-all cursor-pointer" onClick={() => setCurrentPage('chat')}>
                <Icon name="MessageCircle" className="text-neon-pink mb-4" size={48} />
                <h3 className="text-2xl font-bold mb-2">Чат</h3>
                <p className="text-muted-foreground">Общайся с другими игроками</p>
              </Card>
            </div>
          </div>
        )}

        {currentPage === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold neon-glow mb-8">Профиль</h2>
            <Card className="p-8 neon-border">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-4xl">
                  👤
                </div>
                <div>
                  <h3 className="text-3xl font-bold">Игрок #1</h3>
                  <p className="text-muted-foreground">Время на сайте: {formatTime(timeSpent)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">ТитулКоины:</span>
                  <Badge className="neon-border-cyan text-xl px-4 py-2">{coins} TC</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg">Титулов куплено:</span>
                  <Badge className="neon-border-pink text-xl px-4 py-2">{purchasedTitles.length}</Badge>
                </div>
                <div>
                  <span className="text-lg mb-2 block">Мои титулы:</span>
                  <div className="flex flex-wrap gap-2">
                    {purchasedTitles.length > 0 ? (
                      purchasedTitles.map(title => {
                        const titleData = titles.find(t => t.name === title);
                        return (
                          <Badge key={title} className={`${titleData?.color} neon-border text-lg px-4 py-2`}>
                            {title}
                          </Badge>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">Титулы пока не куплены</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentPage === 'titles' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-glow mb-4 sm:mb-8">Магазин титулов</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {titles.map(title => {
                const isPurchased = purchasedTitles.includes(title.name);
                const canAfford = coins >= title.price;
                
                return (
                  <Card key={title.name} className={`p-6 ${isPurchased ? 'neon-border' : 'hover:neon-border'} transition-all`}>
                    <div className="space-y-4">
                      <div className={`text-2xl font-bold ${title.color} ${isPurchased ? '' : 'no-select blur-sm'}`}>
                        {title.name}
                      </div>
                      <p className="text-muted-foreground">{title.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge className="neon-border-cyan text-lg px-3 py-1">
                          <Icon name="Coins" className="mr-1" size={16} />
                          {title.price} TC
                        </Badge>
                        {isPurchased ? (
                          <Badge className="neon-border bg-green-500/20 text-green-400">
                            <Icon name="Check" className="mr-1" size={16} />
                            Куплено
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleBuyTitle(title)}
                            disabled={!canAfford}
                            className={canAfford ? 'neon-border' : ''}
                          >
                            Купить
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {currentPage === 'quests' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-glow mb-4 sm:mb-8">Квесты</h2>
            <div className="space-y-3 sm:space-y-4">
              {quests.map(quest => (
                <Card key={quest.id} className={`p-4 sm:p-6 ${quest.completed ? 'neon-border bg-green-500/10' : 'hover:neon-border'} transition-all`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-xl font-bold mb-2">{quest.title}</h3>
                      <div className="flex items-center gap-4">
                        <Badge className="neon-border-cyan">
                          <Icon name="Coins" className="mr-1" size={16} />
                          +{quest.reward} TC
                        </Badge>
                        {quest.completed && (
                          <Badge className="neon-border bg-green-500/20 text-green-400">
                            <Icon name="Check" className="mr-1" size={16} />
                            Выполнено
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-4xl">{quest.completed ? '✅' : '⏳'}</div>
                  </div>
                  {!quest.completed && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Прогресс</span>
                        <span>{Math.round(quest.progress)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-300"
                          style={{ width: `${quest.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold neon-glow mb-4 sm:mb-8">Чат</h2>
            <Card className="neon-border">
              <ScrollArea className="h-[400px] sm:h-[500px] p-3 sm:p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">👤</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">Админ</span>
                        <Badge className="text-xs neon-border-pink">[ADMIN]</Badge>
                      </div>
                      <p className="text-muted-foreground">Добро пожаловать в чат ЧикенТитул!</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">👤</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">Игрок_123</span>
                        <Badge className="text-xs neon-border">[VIP]</Badge>
                      </div>
                      <p className="text-muted-foreground">Всем привет! Как собирать ТитулКоины?</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input placeholder="Введите сообщение..." className="flex-1" />
                  <Button className="neon-border">
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentPage === 'admin' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold neon-glow mb-8">Админ-панель</h2>
            <Card className="p-8 neon-border-pink">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Онлайн игроков</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-neon-pulse" />
                        <span>Игрок #1</span>
                      </div>
                      <Badge className="neon-border-cyan">500 TC</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Выдать ТитулКоины</h3>
                  <div className="flex gap-2">
                    <Input placeholder="Имя игрока" />
                    <Input placeholder="Количество" type="number" className="w-32" />
                    <Button className="neon-border">Выдать</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" autoPlay loop volume={0.3} className="hidden" />
    </div>
  );
};

export default Index;