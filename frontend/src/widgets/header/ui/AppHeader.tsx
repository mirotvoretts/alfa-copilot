import { motion } from 'motion/react';
import type { EntrepreneurProfile } from 'shared/config';

export interface AppHeaderProps {
  readonly entrepreneur: EntrepreneurProfile;
  readonly monthsWithBank: number;
}

export const AppHeader = ({ entrepreneur, monthsWithBank }: AppHeaderProps) => (
  <motion.header
    className="app-header"
    initial={{ opacity: 0, y: -14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: 'easeOut' }}
  >
    <div className="app-header__brand">
      <span className="app-header__mark" aria-hidden>
        А
      </span>
      <div className="app-header__titles">
        <span className="app-header__eyebrow">АльфаЗапуск</span>
        <h1>АльфаКопилот</h1>
      </div>
    </div>
    <div className="app-header__profile">
      <span className="app-header__avatar" aria-hidden>
        {entrepreneur.name.charAt(0)}
      </span>
      <div className="app-header__profile-text">
        <strong>
          {entrepreneur.name}, {entrepreneur.age}
        </strong>
        <span>
          {entrepreneur.niche} · {entrepreneur.city} · {monthsWithBank} мес с Альфой
        </span>
      </div>
    </div>
  </motion.header>
);
