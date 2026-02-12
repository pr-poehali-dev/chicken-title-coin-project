import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: number;
  username: string;
  coins: number;
  is_admin: boolean;
  time_spent_seconds?: number;
}

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: UserData) => void;
}

const AUTH_URL = 'https://functions.poehali.dev/ecbf6b67-00a5-46cf-9baa-136d2079a209';

export const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username,
          password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: isLogin ? 'Вход выполнен!' : 'Регистрация успешна!',
          description: `Добро пожаловать, ${data.user.username}!`,
        });
        onSuccess(data.user);
        onOpenChange(false);
        setUsername('');
        setPassword('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Что-то пошло не так',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card neon-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold neon-glow">
            {isLogin ? 'Вход' : 'Регистрация'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя"
              required
              minLength={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full neon-border" disabled={loading}>
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};