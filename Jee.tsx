import { ExamPage } from '@/pages/ExamPage'

export default function Jee() {
  return (
    <ExamPage
      exam="JEE Mains"
      subjects={['Physics', 'Chemistry', 'Mathematics']}
      title="JEE Mains previous year questions by year and shift — EduMahi"
      description="JEE Mains Physics, Chemistry and Mathematics questions sorted by year and shift, with a step-by-step solution on every question in Hindi and English."
      heading="JEE Mains: year, shift, subject."
      intro="Physics, Chemistry and Mathematics. Previous year questions keep their paper year and shift, so a session mirrors one sitting rather than a random mix."
      shifts
    />
  )
}
