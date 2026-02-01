export const sendResponse = (
  res,
  { message = 'Request successful', data = [], paging = null, httpStatus = 200 }
) => {
  return res.status(httpStatus).json({
    status: {
      code: httpStatus,
      message,
    },
    data: Array.isArray(data) ? data : [data],
    paging,
  });
};
