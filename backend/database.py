"""
Database models and connection for EHR AI System
Uses SQLite for simplicity, easily upgradable to PostgreSQL
"""
import sqlite3
from datetime import datetime
from pathlib import Path
import json
from typing import List, Dict, Optional

# Database path
DB_PATH = Path(__file__).parent / "ehr_data.db"


class Database:
    """Database handler for EHR system"""
    
    def __init__(self, db_path: str = str(DB_PATH)):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Enhanced Images Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS enhanced_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                enhanced_filename TEXT NOT NULL,
                image_type TEXT NOT NULL,
                enhancement_metrics TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Clinical Notes Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clinical_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT NOT NULL,
                patient_name TEXT NOT NULL,
                note_type TEXT NOT NULL,
                subjective TEXT,
                objective TEXT,
                assessment TEXT,
                plan TEXT,
                full_note TEXT NOT NULL,
                icd10_codes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # ICD-10 Codes Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS icd10_suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                diagnosis TEXT NOT NULL,
                icd10_code TEXT NOT NULL,
                description TEXT NOT NULL,
                confidence REAL,
                patient_id TEXT,
                note_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (note_id) REFERENCES clinical_notes (id)
            )
        ''')
        
        # Patients Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                age INTEGER,
                gender TEXT,
                status TEXT DEFAULT 'active',
                last_visit TIMESTAMP,
                total_images INTEGER DEFAULT 0,
                total_notes INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        
        # Seed initial data if empty
        self.seed_initial_data()
    
    def seed_initial_data(self):
        """Seed database with initial patient data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Check if patients exist
        cursor.execute('SELECT COUNT(*) as count FROM patients')
        if cursor.fetchone()['count'] == 0:
            # Add 6 active patients
            patients = [
                ('P001', 'Aaryan Choudhary', 45, 'Male'),
                ('P002', 'Sushmita Roy', 32, 'Female'),
                ('P003', 'Rohan Mehta', 58, 'Male'),
                ('P004', 'Priya Sharma', 41, 'Female'),
                ('P005', 'Vikram Singh', 67, 'Male'),
                ('P006', 'Ananya Desai', 29, 'Female'),
            ]
            
            for pid, name, age, gender in patients:
                cursor.execute('''
                    INSERT INTO patients (patient_id, name, age, gender, status, last_visit)
                    VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
                ''', (pid, name, age, gender))
            
            # Add sample enhanced images
            image_types = ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound']
            for i, (pid, name, _, _) in enumerate(patients):
                num_images = 15 + (i * 3)  # Varying number of images
                for j in range(num_images):
                    img_type = image_types[j % len(image_types)]
                    metrics = json.dumps({
                        'psnr': 28.5 + (j % 5),
                        'ssim': 0.85 + (j % 10) * 0.01,
                        'quality_score': 85 + (j % 15)
                    })
                    cursor.execute('''
                        INSERT INTO enhanced_images (
                            patient_id, patient_name, original_filename, 
                            enhanced_filename, image_type, enhancement_metrics
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        pid, name, 
                        f'original_{img_type.lower().replace(" ", "_")}_{j}.dcm',
                        f'enhanced_{img_type.lower().replace(" ", "_")}_{j}.png',
                        img_type, metrics
                    ))
            
            # Add sample clinical notes
            note_types = ['SOAP', 'Discharge Summary', 'Radiology Report']
            for i, (pid, name, _, _) in enumerate(patients):
                num_notes = 6 + (i * 2)  # Varying number of notes
                for j in range(num_notes):
                    note_type = note_types[j % len(note_types)]
                    cursor.execute('''
                        INSERT INTO clinical_notes (
                            patient_id, patient_name, note_type, subjective,
                            objective, assessment, plan, full_note
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        pid, name, note_type,
                        f'Patient reports {["mild discomfort", "severe pain", "fatigue"][j % 3]}',
                        f'BP: {120 + j*2}/{80 + j}, HR: {70 + j} bpm',
                        f'{["Hypertension", "Diabetes", "Arthritis"][j % 3]} - stable condition',
                        'Continue current medication, follow-up in 2 weeks',
                        f'Complete {note_type} note for {name}'
                    ))
            
            # Add ICD-10 codes
            icd_codes = [
                ('Hypertension', 'I10', 'Essential (primary) hypertension', 0.95),
                ('Type 2 Diabetes', 'E11', 'Type 2 diabetes mellitus', 0.92),
                ('Arthritis', 'M19.90', 'Unspecified osteoarthritis', 0.88),
                ('Chest Pain', 'R07.9', 'Chest pain, unspecified', 0.85),
            ]
            
            for diagnosis, code, desc, conf in icd_codes:
                for _ in range(10):  # 40 total ICD-10 entries
                    cursor.execute('''
                        INSERT INTO icd10_suggestions (
                            diagnosis, icd10_code, description, confidence
                        ) VALUES (?, ?, ?, ?)
                    ''', (diagnosis, code, desc, conf))
            
            # Update patient stats
            for pid, _, _, _ in patients:
                cursor.execute('''
                    UPDATE patients SET 
                        total_images = (SELECT COUNT(*) FROM enhanced_images WHERE patient_id = ?),
                        total_notes = (SELECT COUNT(*) FROM clinical_notes WHERE patient_id = ?)
                    WHERE patient_id = ?
                ''', (pid, pid, pid))
            
            conn.commit()
        
        conn.close()
    
    # =============== Enhanced Images Methods ===============
    
    def add_enhanced_image(self, patient_id: str, patient_name: str, 
                          original_filename: str, enhanced_filename: str,
                          image_type: str, metrics: Dict) -> int:
        """Add enhanced image record"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO enhanced_images (
                patient_id, patient_name, original_filename, 
                enhanced_filename, image_type, enhancement_metrics
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (patient_id, patient_name, original_filename, 
              enhanced_filename, image_type, json.dumps(metrics)))
        
        image_id = cursor.lastrowid
        
        # Update patient stats
        cursor.execute('''
            UPDATE patients SET 
                total_images = total_images + 1,
                last_visit = CURRENT_TIMESTAMP
            WHERE patient_id = ?
        ''', (patient_id,))
        
        conn.commit()
        conn.close()
        return image_id
    
    def get_enhanced_images(self, patient_id: Optional[str] = None, 
                           limit: int = 100) -> List[Dict]:
        """Get enhanced images"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if patient_id:
            cursor.execute('''
                SELECT * FROM enhanced_images 
                WHERE patient_id = ? 
                ORDER BY created_at DESC LIMIT ?
            ''', (patient_id, limit))
        else:
            cursor.execute('''
                SELECT * FROM enhanced_images 
                ORDER BY created_at DESC LIMIT ?
            ''', (limit,))
        
        images = [dict(row) for row in cursor.fetchall()]
        
        # Parse metrics JSON
        for img in images:
            if img['enhancement_metrics']:
                img['enhancement_metrics'] = json.loads(img['enhancement_metrics'])
        
        conn.close()
        return images
    
    def get_image_stats(self) -> Dict:
        """Get image enhancement statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as total FROM enhanced_images')
        total = cursor.fetchone()['total']
        
        cursor.execute('''
            SELECT image_type, COUNT(*) as count 
            FROM enhanced_images 
            GROUP BY image_type
        ''')
        by_type = {row['image_type']: row['count'] for row in cursor.fetchall()}
        
        conn.close()
        return {'total': total, 'by_type': by_type}
    
    # =============== Clinical Notes Methods ===============
    
    def add_clinical_note(self, patient_id: str, patient_name: str,
                         note_type: str, subjective: str, objective: str,
                         assessment: str, plan: str, full_note: str,
                         icd10_codes: Optional[List] = None) -> int:
        """Add clinical note"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO clinical_notes (
                patient_id, patient_name, note_type, subjective,
                objective, assessment, plan, full_note, icd10_codes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (patient_id, patient_name, note_type, subjective,
              objective, assessment, plan, full_note,
              json.dumps(icd10_codes) if icd10_codes else None))
        
        note_id = cursor.lastrowid
        
        # Update patient stats
        cursor.execute('''
            UPDATE patients SET 
                total_notes = total_notes + 1,
                last_visit = CURRENT_TIMESTAMP
            WHERE patient_id = ?
        ''', (patient_id,))
        
        conn.commit()
        conn.close()
        return note_id
    
    def get_clinical_notes(self, patient_id: Optional[str] = None,
                          note_type: Optional[str] = None,
                          limit: int = 100) -> List[Dict]:
        """Get clinical notes"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM clinical_notes WHERE 1=1'
        params = []
        
        if patient_id:
            query += ' AND patient_id = ?'
            params.append(patient_id)
        
        if note_type:
            query += ' AND note_type = ?'
            params.append(note_type)
        
        query += ' ORDER BY created_at DESC LIMIT ?'
        params.append(limit)
        
        cursor.execute(query, params)
        notes = [dict(row) for row in cursor.fetchall()]
        
        # Parse ICD-10 codes JSON
        for note in notes:
            if note['icd10_codes']:
                note['icd10_codes'] = json.loads(note['icd10_codes'])
        
        conn.close()
        return notes
    
    def get_note_stats(self) -> Dict:
        """Get clinical notes statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as total FROM clinical_notes')
        total = cursor.fetchone()['total']
        
        cursor.execute('''
            SELECT note_type, COUNT(*) as count 
            FROM clinical_notes 
            GROUP BY note_type
        ''')
        by_type = {row['note_type']: row['count'] for row in cursor.fetchall()}
        
        conn.close()
        return {'total': total, 'by_type': by_type}
    
    # =============== ICD-10 Methods ===============
    
    def add_icd10_suggestion(self, diagnosis: str, icd10_code: str,
                            description: str, confidence: float,
                            patient_id: Optional[str] = None,
                            note_id: Optional[int] = None) -> int:
        """Add ICD-10 code suggestion"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO icd10_suggestions (
                diagnosis, icd10_code, description, confidence,
                patient_id, note_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (diagnosis, icd10_code, description, confidence,
              patient_id, note_id))
        
        suggestion_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return suggestion_id
    
    def get_icd10_suggestions(self, diagnosis: Optional[str] = None,
                             limit: int = 100) -> List[Dict]:
        """Get ICD-10 suggestions"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if diagnosis:
            cursor.execute('''
                SELECT * FROM icd10_suggestions 
                WHERE diagnosis LIKE ? 
                ORDER BY confidence DESC, created_at DESC LIMIT ?
            ''', (f'%{diagnosis}%', limit))
        else:
            cursor.execute('''
                SELECT * FROM icd10_suggestions 
                ORDER BY created_at DESC LIMIT ?
            ''', (limit,))
        
        suggestions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return suggestions
    
    def get_icd10_stats(self) -> Dict:
        """Get ICD-10 statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as total FROM icd10_suggestions')
        total = cursor.fetchone()['total']
        
        cursor.execute('''
            SELECT icd10_code, description, COUNT(*) as count 
            FROM icd10_suggestions 
            GROUP BY icd10_code, description
            ORDER BY count DESC LIMIT 10
        ''')
        top_codes = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return {'total': total, 'top_codes': top_codes}
    
    # =============== Patients Methods ===============
    
    def add_patient(self, patient_id: str, name: str, 
                   age: int, gender: str) -> int:
        """Add new patient"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO patients (patient_id, name, age, gender)
                VALUES (?, ?, ?, ?)
            ''', (patient_id, name, age, gender))
            
            pid = cursor.lastrowid
            conn.commit()
            conn.close()
            return pid
        except sqlite3.IntegrityError:
            # Patient already exists
            conn.close()
            return None
    
    def get_patients(self, status: str = 'active') -> List[Dict]:
        """Get patients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM patients 
            WHERE status = ?
            ORDER BY last_visit DESC
        ''', (status,))
        
        patients = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return patients
    
    def get_patient_stats(self) -> Dict:
        """Get patient statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as total FROM patients WHERE status='active'")
        active = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(*) as total FROM patients')
        total = cursor.fetchone()['total']
        
        cursor.execute('''
            SELECT SUM(total_images) as total_images,
                   SUM(total_notes) as total_notes
            FROM patients WHERE status='active'
        ''')
        totals = dict(cursor.fetchone())
        
        conn.close()
        return {
            'active_patients': active,
            'total_patients': total,
            'total_images': totals['total_images'] or 0,
            'total_notes': totals['total_notes'] or 0
        }
    
    # =============== Dashboard Methods ===============
    
    def get_dashboard_stats(self) -> Dict:
        """Get comprehensive dashboard statistics"""
        return {
            'patients': self.get_patient_stats(),
            'images': self.get_image_stats(),
            'notes': self.get_note_stats(),
            'icd10': self.get_icd10_stats()
        }
