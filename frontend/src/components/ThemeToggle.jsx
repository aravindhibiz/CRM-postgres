
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import Icon from './AppIcon';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-150 ease-smooth"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
    </button>
  );
};

export default ThemeToggle;
