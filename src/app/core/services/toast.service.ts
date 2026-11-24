import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4500
    };

    this._toasts.update(current => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newToast.duration);
    }

    return id;
  }

  success(message: string, title: string = 'Success', duration = 4000): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(message: string, title: string = 'Error', duration = 6000): void {
    this.show({ type: 'error', title, message, duration });
  }

  warning(message: string, title: string = 'Warning', duration = 5000): void {
    this.show({ type: 'warning', title, message, duration });
  }

  info(message: string, title: string = 'Information', duration = 4000): void {
    this.show({ type: 'info', title, message, duration });
  }

  dismiss(id: string): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
