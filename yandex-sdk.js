/**
 * Модуль интеграции с Yandex Games SDK
 * Автоматически определяет запуск внутри платформы или локально в браузере.
 */
class YandexSDKWrapper {
  constructor() {
    this.ysdk = null;
    this.player = null;
    this.isInitialized = false;
    this.lastInterstitialTime = 0;
    this.interstitialCooldownMs = 65000; // Яндекс рекомендует не чаще 60-90 сек
  }

  async init() {
    if (typeof YaGames !== 'undefined') {
      try {
        this.ysdk = await YaGames.init();
        this.isInitialized = true;
        console.log('[YandexSDK] Успешно инициализирован');

        // Инициализация игрока для облачных сохранений
        try {
          this.player = await this.ysdk.getPlayer({ scopes: false });
        } catch (e) {
          console.warn('[YandexSDK] Гостевой режим (без авторизации):', e);
        }

        // Сообщаем Яндексу, что игра загрузилась
        if (this.ysdk.features && this.ysdk.features.LoadingAPI) {
          this.ysdk.features.LoadingAPI.ready();
        }
      } catch (err) {
        console.warn('[YandexSDK] Ошибка инициализации SDK:', err);
      }
    } else {
      console.log('[YandexSDK] Локальный режим (SDK не найден, используется localStorage)');
    }
  }

  /**
   * Показ межстраничной рекламы (Interstitial) с кулдауном
   */
  showInterstitial(onClose) {
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.interstitialCooldownMs) {
      if (onClose) onClose();
      return;
    }

    if (this.ysdk && this.ysdk.adv) {
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onClose: (wasShown) => {
            this.lastInterstitialTime = Date.now();
            if (onClose) onClose();
          },
          onError: (err) => {
            console.warn('[YandexSDK] Ошибка Interstitial:', err);
            if (onClose) onClose();
          }
        }
      });
    } else {
      console.log('[YandexSDK Эмуляция] Показ межстраничной рекламы');
      this.lastInterstitialTime = Date.now();
      if (onClose) onClose();
    }
  }

  /**
   * Показ рекламы за вознаграждение (Rewarded Video)
   */
  showRewardedVideo(onReward, onClose) {
    if (this.ysdk && this.ysdk.adv) {
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onRewarded: () => {
            console.log('[YandexSDK] Награда получена');
            if (onReward) onReward();
          },
          onClose: () => {
            if (onClose) onClose();
          },
          onError: (err) => {
            console.warn('[YandexSDK] Ошибка Rewarded Video:', err);
            if (onClose) onClose();
          }
        }
      });
    } else {
      // В режиме разработки сразу выдаем награду через 1 сек
      console.log('[YandexSDK Эмуляция] Показ видео с наградой');
      setTimeout(() => {
        if (onReward) onReward();
        if (onClose) onClose();
      }, 500);
    }
  }

  /**
   * Загрузка рекорда (Облако или LocalStorage)
   */
  async loadBestScore() {
    if (this.player) {
      try {
        const data = await this.player.getData(['bestScore']);
        if (data && typeof data.bestScore === 'number') {
          return data.bestScore;
        }
      } catch (e) {
        console.warn('[YandexSDK] Ошибка чтения облака:', e);
      }
    }
    const local = localStorage.getItem('block_blast_best_score');
    return local ? parseInt(local, 10) : 0;
  }

  /**
   * Сохранение рекорда
   */
  async saveBestScore(score) {
    localStorage.setItem('block_blast_best_score', score.toString());
    if (this.player) {
      try {
        await this.player.setData({ bestScore: score });
      } catch (e) {
        console.warn('[YandexSDK] Ошибка сохранения в облако:', e);
      }
    }
  }
}

window.yaSdk = new YandexSDKWrapper();
