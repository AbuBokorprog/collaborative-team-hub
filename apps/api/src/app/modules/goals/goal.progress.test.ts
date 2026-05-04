// Test file for goal progress calculation
// This is a simple test to verify the progress calculation logic

import { Task } from '../../../generated/prisma/client'

const testProgressCalculation = () => {
  console.log('Testing Goal Progress Calculation...')

  // Test Case 1: No tasks
  const tasks1: Task[] = []
  const expected1 = 0
  const actual1 =
    tasks1.length === 0
      ? 0
      : Math.round(
          (tasks1.filter(t => t.status === 'DONE').length / tasks1.length) *
            100,
        )
  console.log(
    `Test 1 - No tasks: ${actual1 === expected1 ? 'PASS' : 'FAIL'} (Expected: ${expected1}, Actual: ${actual1})`,
  )

  // Test Case 2: All tasks done
  const tasks2 = [{ status: 'DONE' }, { status: 'DONE' }, { status: 'DONE' }]
  const expected2 = 100
  const actual2 = Math.round(
    (tasks2.filter(t => t.status === 'DONE').length / tasks2.length) * 100,
  )
  console.log(
    `Test 2 - All done: ${actual2 === expected2 ? 'PASS' : 'FAIL'} (Expected: ${expected2}, Actual: ${actual2})`,
  )

  // Test Case 3: Half tasks done
  const tasks3 = [
    { status: 'DONE' },
    { status: 'TODO' },
    { status: 'IN_PROGRESS' },
    { status: 'DONE' },
  ]
  const expected3 = 50
  const actual3 = Math.round(
    (tasks3.filter(t => t.status === 'DONE').length / tasks3.length) * 100,
  )
  console.log(
    `Test 3 - Half done: ${actual3 === expected3 ? 'PASS' : 'FAIL'} (Expected: ${expected3}, Actual: ${actual3})`,
  )

  // Test Case 4: One third done
  const tasks4 = [
    { status: 'DONE' },
    { status: 'TODO' },
    { status: 'IN_PROGRESS' },
  ]
  const expected4 = 33
  const actual4 = Math.round(
    (tasks4.filter(t => t.status === 'DONE').length / tasks4.length) * 100,
  )
  console.log(
    `Test 4 - One third done: ${actual4 === expected4 ? 'PASS' : 'FAIL'} (Expected: ${expected4}, Actual: ${actual4})`,
  )

  console.log('Goal Progress Calculation Tests Complete!')
}

// Test task status breakdown
const testTaskStatusBreakdown = () => {
  console.log('\nTesting Task Status Breakdown...')

  const tasks = [
    { status: 'TODO' },
    { status: 'TODO' },
    { status: 'IN_PROGRESS' },
    { status: 'REVIEW' },
    { status: 'DONE' },
    { status: 'DONE' },
    { status: 'OVERDUE' },
  ]

  const breakdown = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    overdue: 0,
  }

  tasks.forEach(task => {
    switch (task.status) {
      case 'TODO':
        breakdown.todo++
        break
      case 'IN_PROGRESS':
        breakdown.inProgress++
        break
      case 'REVIEW':
        breakdown.review++
        break
      case 'DONE':
        breakdown.done++
        break
      case 'OVERDUE':
        breakdown.overdue++
        break
    }
  })

  const expected = {
    total: 7,
    todo: 2,
    inProgress: 1,
    review: 1,
    done: 2,
    overdue: 1,
  }

  const isCorrect =
    breakdown.total === expected.total &&
    breakdown.todo === expected.todo &&
    breakdown.inProgress === expected.inProgress &&
    breakdown.review === expected.review &&
    breakdown.done === expected.done &&
    breakdown.overdue === expected.overdue

  console.log(`Task Breakdown Test: ${isCorrect ? 'PASS' : 'FAIL'}`)
  console.log(`Expected: ${JSON.stringify(expected)}`)
  console.log(`Actual: ${JSON.stringify(breakdown)}`)
}

// Run tests
testProgressCalculation()
testTaskStatusBreakdown()

export { testProgressCalculation, testTaskStatusBreakdown }
