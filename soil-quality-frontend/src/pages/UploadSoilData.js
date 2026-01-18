import React, { useRef, useState } from 'react';
import styles from './UploadSoilData.module.css';

const initialForm = { N: '', P: '', K: '', pH: '', moisture: '', temperature: '', humidity: '', rainfall: '' };

export default function UploadSoilData() {
  const [csvFile, setCsvFile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRef = useRef();

  const handleDrop = e => {
    e.preventDefault();
    setCsvFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = e => e.preventDefault();
  const handleFileChange = e => setCsvFile(e.target.files[0]);
  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const err = {};
    Object.entries(form).forEach(([k, v]) => {
      if (!v) err[k] = 'Required';
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) {
      setShowValidation(true);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowValidation(false);
      setForm(initialForm);
      setCsvFile(null);
    }, 1500);
  };

  return (
    <div className={styles.bgWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Upload Soil Data</h1>
        <div
          className={styles.dropArea}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current.click()}
        >
          <input
            type="file"
            accept=".csv"
            ref={inputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {csvFile ? (
            <span className={styles.fileName}>{csvFile.name}</span>
          ) : (
            <span>Drag & drop CSV here or click to browse</span>
          )}
        </div>
        <div className={styles.or}>OR</div>
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles.grid}>
            {Object.keys(initialForm).map(key => (
              <div key={key} className={styles.inputGroup}>
                <label htmlFor={key}>{key.toUpperCase()}</label>
                <input
                  id={key}
                  name={key}
                  value={form[key]}
                  onChange={handleInput}
                  className={errors[key] ? styles.errorInput : ''}
                  type="text"
                  autoComplete="off"
                />
                {errors[key] && <span className={styles.errorMsg}>{errors[key]}</span>}
              </div>
            ))}
          </div>
          <button className={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        <div className={styles.livePreview}>
          <div className={styles.cameraPlaceholder}>[ Live Camera Preview Coming Soon ]</div>
        </div>
        {showValidation && (
          <div className={styles.validationModal}>
            <div>
              <h2>Validation Error</h2>
              <p>Please fill all fields correctly.</p>
              <button onClick={() => setShowValidation(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
