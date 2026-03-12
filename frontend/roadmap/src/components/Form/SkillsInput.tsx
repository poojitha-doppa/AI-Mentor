import { useState } from 'react';
import styles from './SkillsInput.module.css';

interface SkillsInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export default function SkillsInput({ skills, onSkillsChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = inputValue.trim();
      if (skill && !skills.includes(skill)) {
        onSkillsChange([...skills, skill]);
        setInputValue('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Core Competencies *</label>
      <input
        type="text"
        placeholder="Add skills and press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={styles.input}
      />
      <div className={styles.tags}>
        {skills.map((skill) => (
          <span key={skill} className={styles.tag}>
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className={styles.removeBtn}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
