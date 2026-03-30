export class NotificationService {
  static requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  static sendNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo.png',
        ...options,
      });
    }
  };

  static setPeriodReminder = (periodDate, daysBefore = 1) => {
    const reminderDate = new Date(periodDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        NotificationService.sendNotification('🩸 Period Alert', {
          body: 'Your period is coming soon! Time to prepare.',
          tag: 'period-reminder',
          requireInteraction: true,
        });
      }, timeUntilReminder);
    }
  };

  static setLoggingReminder = (time = '09:00') => {
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduleReminder = () => {
      const now = new Date();
      let reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        NotificationService.sendNotification('📝 Time to Log Your Symptoms', {
          body: 'How are you feeling today? Take a moment to log your symptoms.',
          tag: 'logging-reminder',
        });

        scheduleReminder();
      }, timeUntilReminder);
    };

    scheduleReminder();
  };
}
