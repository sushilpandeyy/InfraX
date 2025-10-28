import React from 'react';

interface RetroIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const RetroIcon: React.FC<RetroIconProps> = ({ type, size = 'md', className = '' }) => {
  const icons: Record<string, string> = {
    // Dashboard & Navigation
    'dashboard': '╔═╗\n║▓║\n╚═╝',
    'menu': '▓▓▓\n▓▓▓\n▓▓▓',
    'home': '▲\n▓▓▓',

    // Workflow & Process
    'workflow': '→▓→',
    'code': '</> ',
    'terminal': '█ _',
    'cpu': '[█]',
    'server': '▓▓▓',

    // Actions
    'create': '[+]',
    'edit': '[✎]',
    'delete': '[×]',
    'save': '[↓]',
    'upload': '[↑]',
    'download': '[↓]',
    'refresh': '[⟳]',
    'play': '[▶]',
    'stop': '[■]',
    'pause': '[‖]',

    // Status
    'success': '[✓]',
    'error': '[!]',
    'warning': '[△]',
    'info': '[i]',
    'loading': '[⟳]',

    // Infrastructure
    'cloud': '☁▓☁',
    'database': '[▓]',
    'storage': '▓□▓',
    'network': '▓-▓',
    'security': '[#]',

    // Analytics
    'chart': '▓╱',
    'money': '[$]',
    'stats': '▓▁▂',
    'graph': '╱▓╲',

    // AI & Intelligence
    'brain': '◉◉',
    'ai': '[∆]',
    'robot': '◢▓◣',
    'spark': '[*]',

    // Documents & Files
    'file': '▓',
    'folder': '▢',
    'document': '[=]',
    'list': '▓\n▓\n▓',

    // Communication
    'chat': '▓▓\n▓▓',
    'message': '▓▓',
    'notification': '◉',
    'alert': '[!]',

    // Settings & Tools
    'settings': '[⚙]',
    'tools': '[⚒]',
    'config': '[≡]',
    'key': '[♯]',

    // User & Account
    'user': '◉\n▓',
    'team': '◉◉',
    'profile': '[U]',

    // Time & Calendar
    'clock': '[○]',
    'calendar': '▓▓',
    'schedule': '▓=',

    // Arrows & Directions
    'arrow-up': '[↑]',
    'arrow-down': '[↓]',
    'arrow-left': '[←]',
    'arrow-right': '[→]',
    'expand': '[⇄]',
  };

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  };

  const icon = icons[type] || '[?]';

  return (
    <div
      className={`
        font-mono
        ${sizeClasses[size]}
        ${className}
        inline-block
        whitespace-pre
        leading-none
        text-center
      `}
      style={{
        fontFamily: 'Courier New, monospace',
        lineHeight: '0.9',
        letterSpacing: '-0.05em',
      }}
    >
      {icon}
    </div>
  );
};

export default RetroIcon;
