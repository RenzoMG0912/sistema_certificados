export const state = {
  participants: [],
  courses: [],
  enrollments: [],
  certificates: [],
  signatures: [],
  participantQuery: '',
  participantPage: 1,
  participantPageSize: 5,
  enrollmentCreateQuery: '',
  enrollmentCreateSelected: new Set(),
  enrollmentEditQuery: '',
  enrollmentEditSelected: new Set(),
  enrollmentEditCourseId: null,
  enrollmentEditCurrent: [],
  enrollmentEditAvailable: []
};
