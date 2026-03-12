import { useState } from 'react';
import { SimulationInput } from '../../types/index';
import SkillsInput from './SkillsInput';
import styles from './SimulationForm.module.css';

interface SimulationFormProps {
  onSubmit: (input: SimulationInput) => void;
  isLoading: boolean;
}

export default function SimulationForm({ onSubmit, isLoading }: SimulationFormProps) {
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    skills: [] as string[],
    dailyStudyHours: 1,
    targetSalary: '',
  });

  const isFormValid =
    formData.currentRole.trim() !== '' &&
    formData.targetRole.trim() !== '' &&
    formData.dailyStudyHours > 0 &&
    formData.targetSalary.trim() !== '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'dailyStudyHours' ? parseFloat(value) : value,
    }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Discover Your Next Career Move</h1>

      <div className={styles.formGrid}>
        <div>
          <label htmlFor="currentRole" className={styles.label}>
            Current Position *
          </label>
          <input
            id="currentRole"
            type="text"
            name="currentRole"
            placeholder="Your current role"
            value={formData.currentRole}
            onChange={handleInputChange}
            className={styles.input}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="targetRole" className={styles.label}>
            Target Position *
          </label>
          <input
            id="targetRole"
            type="text"
            name="targetRole"
            placeholder="Your target role"
            value={formData.targetRole}
            onChange={handleInputChange}
            className={styles.input}
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <SkillsInput skills={formData.skills} onSkillsChange={handleSkillsChange} />
      </div>

      <div className={styles.formGrid}>
        <div>
          <label htmlFor="dailyStudyHours" className={styles.label}>
            Daily Learning Commitment *
          </label>
          <input
            id="dailyStudyHours"
            type="number"
            name="dailyStudyHours"
            min="0.5"
            max="12"
            step="0.5"
            placeholder="Hours per day"
            value={formData.dailyStudyHours}
            onChange={handleInputChange}
            className={styles.input}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="targetSalary" className={styles.label}>
            Target Annual Compensation *
          </label>
          <input
            id="targetSalary"
            type="text"
            name="targetSalary"
            placeholder="Salary in LPA"
            value={formData.targetSalary}
            onChange={handleInputChange}
            className={styles.input}
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={styles.submitBtn}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Analyzing Career Path...
          </>
        ) : (
          'Generate Career Roadmap'
        )}
      </button>
    </form>
  );
}
