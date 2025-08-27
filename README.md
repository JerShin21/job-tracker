# Job Tracker - Personal Application Management System

A comprehensive web application for managing job applications and internship searches. Track applications through the entire process from discovery to offer acceptance, with document management, interview scheduling, and progress analytics.

## Features

### Core Functionality
- **Application Pipeline Management**: Kanban-style board with drag-and-drop status updates
- **Job Entry System**: Add jobs manually or parse job descriptions automatically
- **Interview Stage Tracking**: Monitor progress through multiple interview rounds
- **Document Management**: Upload and organize resumes, cover letters, and offer documents
- **Calendar & Reminders**: Track deadlines, interview dates, and follow-up tasks
- **Analytics Dashboard**: Visualize application progress and success metrics

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, modern interface with logical information hierarchy
- **Real-time Updates**: Instant feedback for all actions and state changes
- **Smart Filtering**: Filter and organize applications by status, company, or priority

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling and responsive design
- **React Query** for efficient data fetching and caching
- **React Router** for client-side routing
- **ApexCharts** for data visualization

### Backend
- **Django 5.2** with Django REST Framework
- **PostgreSQL** database with optimized queries
- **JWT Authentication** with refresh token support
- **AWS S3** integration for file storage
- **Django CORS** for secure cross-origin requests

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+
- PostgreSQL 13+
- AWS Account (for S3 storage)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database and AWS credentials

# Run migrations
python manage.py migrate
python manage.py createsuperuser
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API base URL

npm start
```

4. **Environment Configuration**

Backend `.env`:
```
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=postgresql://username:password@localhost:5432/job_tracker
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket
AWS_S3_REGION_NAME=us-east-1
```

Frontend `.env`:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## Usage

### Adding Your First Job Application

1. **Navigate to "Add Job"** in the main navigation
2. **Enter job details** either manually or by pasting a job description
3. **Click "Add Role & Start Tracking"** to create the application
4. **Update status** by dragging cards in the pipeline view or using the edit modal

### Managing Application Progress

- **Pipeline View**: Drag applications between status columns
- **Application Detail**: View comprehensive information and add interview stages
- **Documents**: Upload tailored resumes, cover letters, and other materials
- **Reminders**: Set deadlines for applications, interviews, and follow-ups

### Analytics and Reporting

- **Dashboard Charts**: Visualize application distribution and success rates
- **Progress Tracking**: Monitor applications through each stage
- **Timeline View**: See chronological progression of each application

## API Documentation

The backend provides RESTful APIs for all functionality:

- **Authentication**: `/api/auth/` (register, login, refresh)
- **Applications**: `/api/applications/` (CRUD operations, status updates)
- **Companies & Roles**: `/api/companies/`, `/api/roles/`
- **Stages**: `/api/stages/` (interview tracking)
- **Documents**: `/api/documents/` (file management with S3)
- **Reminders**: `/api/reminders/` (deadline management)

## Database Schema

The application uses a normalized PostgreSQL schema:

- **Users**: Authentication and profile information
- **Companies**: Company details and metadata
- **Roles**: Job positions with requirements and compensation
- **Applications**: User applications linking to roles
- **Stages**: Interview and assessment stages
- **Documents**: File metadata with S3 references
- **Reminders**: User-defined deadlines and notifications

## Deployment

### AWS Deployment Architecture

- **Frontend**: S3 + CloudFront for global distribution
- **Backend**: Elastic Beanstalk with auto-scaling
- **Database**: RDS PostgreSQL with automated backups
- **File Storage**: S3 with presigned URL uploads
- **Monitoring**: CloudWatch for logs and metrics

### Deployment Scripts

```bash
# Build and deploy frontend
npm run build
aws s3 sync build/ s3://your-frontend-bucket --delete

# Deploy backend
eb deploy production

# Run database migrations
eb ssh -e "source /opt/python/run/venv/bin/activate && python manage.py migrate"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices for frontend code
- Use Django coding standards for backend development
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design for all UI components

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Security Considerations

- JWT tokens with secure refresh mechanism
- CORS properly configured for production domains
- S3 bucket policies restrict unauthorized access
- Input validation and sanitization on all endpoints
- HTTPS enforced in production environment

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web development best practices
- Responsive design inspired by contemporary job search platforms
- Database architecture optimized for performance and scalability

## Support

For issues, feature requests, or questions:
1. Check existing issues in the GitHub repository
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs
4. Provide system information for technical issues

## Roadmap

### Planned Features
- **AI-powered job description parsing** for automated data extraction
- **Salary negotiation tracking** with offer comparison tools
- **Network contact management** for referral tracking
- **Email integration** for automatic application status updates
- **Mobile application** for iOS and Android platforms
- **Team collaboration features** for career services and mentors
