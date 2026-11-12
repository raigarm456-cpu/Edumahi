import { ExamPage } from '@/pages/ExamPage'

export default function Neet() {
  return (
    <ExamPage
      exam="NEET"
      subjects={['Physics', 'Chemistry', 'Biology']}
      title="NEET previous year questions and extra practice — EduMahi"
      description="Physics, Chemistry, Botany and Zoology NEET questions picked by year and chapter, each with a worked solution in Hindi and English."
      heading="NEET: pick a subject, then a year."
      intro="Physics, Chemistry and Biology, split by the chapters the syllabus actually names. Previous year questions sit apart from extra practice, so a revision round is not mixed with a drill round."
    />
  )
}
