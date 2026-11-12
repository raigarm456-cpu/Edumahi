import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Meta } from '@/components/Meta'
import { LangProvider } from '@/components/lang'
import { Shell } from '@/components/Shell'
import Home from '@/pages/Home'

/* Routes are code-split so the first paint carries only the landing page. */
const Neet = lazy(() => import('@/pages/Neet'))
const Jee = lazy(() => import('@/pages/Jee'))
const Practice = lazy(() => import('@/pages/Practice'))
const Quiz = lazy(() => import('@/pages/Quiz'))
const FeedbackPage = lazy(() => import('@/pages/Feedback'))
const About = lazy(() => import('@/pages/About'))
const Admin = lazy(() => import('@/pages/Admin'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <LangProvider>
      <Shell>
        <Suspense
          fallback={<div className="px-gutter py-24 text-sm text-muted-foreground">Loading…</div>}
        >
          <Routes>
            <Route
              index
              element={
                <>
                  <Meta
                    title="EduMahi — free NEET and JEE Mains practice, in Hindi and English"
                    description="Solve previous year and extra practice questions for NEET and JEE Mains with a step-by-step solution on every question, in Hindi or English."
                  />
                  <Home />
                </>
              }
            />
            <Route
              path="neet"
              element={
                <>
                  <Meta
                    title="NEET Physics, Chemistry and Biology practice — EduMahi"
                    description="Pick NEET Physics, Chemistry or Biology and solve previous year questions by year and chapter, or extra practice questions on the same chapter."
                  />
                  <Neet />
                </>
              }
            />
            <Route
              path="jee"
              element={
                <>
                  <Meta
                    title="JEE Mains Physics, Chemistry and Maths practice — EduMahi"
                    description="JEE Mains previous year questions filtered by year and shift, plus extra practice on Physics, Chemistry and Mathematics chapters."
                  />
                  <Jee />
                </>
              }
            />
            <Route
              path="practice"
              element={
                <>
                  <Meta
                    title="Practice Zone — build your own NEET and JEE set"
                    description="Choose exam, subject, chapter and difficulty, pick 10, 20 or 30 questions, and track subject-wise accuracy as you go."
                  />
                  <Practice />
                </>
              }
            />
            <Route
              path="quiz"
              element={
                <>
                  <Meta
                    title="Quiz — one question at a time, Hindi or English"
                    description="Answer MCQs with a step-by-step solution after every submit, switch each question between Hindi and English, and review your score at the end."
                  />
                  <Quiz />
                </>
              }
            />
            <Route
              path="feedback"
              element={
                <>
                  <Meta
                    title="Rate EduMahi and report a question error"
                    description="Tell us what to fix, report a wrong answer key or a translation error, and read what other aspirants say about EduMahi."
                  />
                  <FeedbackPage />
                </>
              }
            />
            <Route
              path="about"
              element={
                <>
                  <Meta
                    title="About EduMahi and how wrong answer keys get fixed"
                    description="EduMahi is a free practice site for NEET and JEE Mains aspirants. Here is how the bank is built and how to report a question that is wrong."
                  />
                  <About />
                </>
              }
            />
            <Route
              path="admin"
              element={
                <>
                  <Meta
                    title="Admin — EduMahi"
                    description="EduMahi admin: add questions and review feedback."
                  />
                  <Admin />
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <Meta title="Page not found — EduMahi" description="That page does not exist on EduMahi." />
                  <NotFound />
                </>
              }
            />
          </Routes>
        </Suspense>
      </Shell>
    </LangProvider>
  )
}
