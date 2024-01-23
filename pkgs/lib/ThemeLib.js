const THEME_DATA_VERSION = 1;
let lib = {};
let Core = {};

const CURSOR_DEFAULT = `data:image/svg+xml,%3Csvg width='20' height='26' viewBox='0 0 20 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1104_663)'%3E%3Cpath d='M14.5 15.5L2 3V19.5L5.5 17L7.30828 21.9728C7.41041 22.2536 7.73448 22.3828 8.00178 22.2491L11.0885 20.7057C11.3211 20.5895 11.4257 20.3143 11.3291 20.0728L9.5 15.5H14.5Z' fill='black'/%3E%3Cpath d='M14.5 15.5L2 3V19.5L5.5 17L7.30828 21.9728C7.41041 22.2536 7.73448 22.3828 8.00178 22.2491L11.0885 20.7057C11.3211 20.5895 11.4257 20.3143 11.3291 20.0728L9.5 15.5H14.5Z' stroke='white' stroke-width='1.5'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1104_663' x='0.55' y='0.489453' width='18.4605' height='25.2633' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1104_663'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1104_663' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_POINTER = `data:image/svg+xml,%3Csvg width='23' height='26' viewBox='0 0 23 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1104_682)'%3E%3Cpath d='M2.36495 13.635L2.17678 13.8232C2.06359 13.9364 2 14.0899 2 14.25C2 14.4101 2.06359 14.5636 2.17678 14.6768L6.5 19L8.5 21L9.35355 21.8536C9.44732 21.9473 9.5745 22 9.70711 22H17C19.2793 21.9375 19.0003 21.9999 19.4992 20.0032C19.4997 20.0012 19.5 19.9989 19.5 19.9968V11.6706C19.5 10.0694 17.4416 9.41611 16.5182 10.7242C16.5126 10.7322 16.5 10.7282 16.5 10.7185V10C16.5 9.01608 15.5361 8.32131 14.6026 8.63246L13.5182 8.99394C13.5092 8.99692 13.5 8.99026 13.5 8.98083V8C13.5 7.36506 12.9033 6.89917 12.2873 7.05317L10.5182 7.49545C10.5089 7.49776 10.5 7.49078 10.5 7.48126V6.75V3.25C10.5 2.55964 9.94036 2 9.25 2H9C8.44772 2 8 2.44772 8 3V15.4254C8 15.4597 7.96394 15.482 7.93328 15.4666L3.80328 13.4016C3.32357 13.1618 2.7442 13.2558 2.36495 13.635Z' fill='black'/%3E%3Cpath d='M10.5 11.5V6.75M10.5 6.75V3.25C10.5 2.55964 9.94036 2 9.25 2H9C8.44772 2 8 2.44772 8 3V3V15.4254C8 15.4597 7.96394 15.482 7.93328 15.4666L3.80328 13.4016C3.32357 13.1618 2.7442 13.2558 2.36495 13.635L2.17678 13.8232C2.06359 13.9364 2 14.0899 2 14.25V14.25C2 14.4101 2.06359 14.5636 2.17678 14.6768L6.5 19L8.5 21L9.35355 21.8536C9.44732 21.9473 9.5745 22 9.70711 22H17C19.2793 21.9375 19.0003 21.9999 19.4992 20.0032C19.4997 20.0012 19.5 19.9989 19.5 19.9968V11.6706C19.5 10.0694 17.4416 9.41611 16.5182 10.7242V10.7242C16.5126 10.7322 16.5 10.7282 16.5 10.7185V10M10.5 6.75V7.48126C10.5 7.49078 10.5089 7.49776 10.5182 7.49545L12.2873 7.05317C12.9033 6.89917 13.5 7.36506 13.5 8V8M13.5 8V10.5V11.5M13.5 8V8.98083C13.5 8.99026 13.5092 8.99692 13.5182 8.99394L14.6026 8.63246C15.5361 8.32131 16.5 9.01608 16.5 10V10M16.5 10V11.5' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1104_682' x='0.55' y='0.55' width='22.4' height='24.9' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1104_682'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1104_682' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_TEXT = `data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1118_622)'%3E%3Cg filter='url(%23filter0_d_1118_622)'%3E%3Cpath d='M14 1H10.5H7V3.07692L9.1 4.07692V15.9231L7 16.9231V19H14V16.9231L11.9 15.9231V4.07692L14 3.07692V1Z' fill='black'/%3E%3Cpath d='M14 1H10.5H7V3.07692L9.1 4.07692V15.9231L7 16.9231V19H14V16.9231L11.9 15.9231V4.07692L14 3.07692V1Z' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1118_622' x='5.55' y='-0.45' width='11.9' height='22.9' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1118_622'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1118_622' result='shape'/%3E%3C/filter%3E%3CclipPath id='clip0_1118_622'%3E%3Crect width='20' height='20' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_NS = `data:image/svg+xml,%3Csvg width='20' height='26' viewBox='0 0 20 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1266_626)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 9H4.71429H3L9 2L15 9H12V15H15L9 22L3 15H4.71429H6V9Z' fill='black'/%3E%3Cpath d='M6 9H6.75V8.25H6V9ZM3 9L2.43056 8.51191L1.36933 9.75H3V9ZM9 2L9.56944 1.51191L9 0.847557L8.43056 1.51191L9 2ZM15 9V9.75H16.6307L15.5694 8.51191L15 9ZM12 9V8.25H11.25V9H12ZM12 15H11.25V15.75H12V15ZM15 15L15.5694 15.4881L16.6307 14.25H15V15ZM9 22L8.43056 22.4881L9 23.1524L9.56944 22.4881L9 22ZM3 15V14.25H1.36933L2.43056 15.4881L3 15ZM6 15V15.75H6.75V15H6ZM4.71429 9.75H6V8.25H4.71429V9.75ZM3 9.75H4.71429V8.25H3V9.75ZM8.43056 1.51191L2.43056 8.51191L3.56944 9.48809L9.56944 2.48809L8.43056 1.51191ZM15.5694 8.51191L9.56944 1.51191L8.43056 2.48809L14.4306 9.48809L15.5694 8.51191ZM12 9.75H15V8.25H12V9.75ZM11.25 9V15H12.75V9H11.25ZM12 15.75H15V14.25H12V15.75ZM14.4306 14.5119L8.43056 21.5119L9.56944 22.4881L15.5694 15.4881L14.4306 14.5119ZM9.56944 21.5119L3.56944 14.5119L2.43056 15.4881L8.43056 22.4881L9.56944 21.5119ZM3 15.75H4.71429V14.25H3V15.75ZM4.71429 15.75H6V14.25H4.71429V15.75ZM6.75 15V9H5.25V15H6.75Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1266_626' x='0.669385' y='0.147656' width='18.6612' height='25.7047' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1266_626'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1266_626' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_EW = `data:image/svg+xml,%3Csvg width='26' height='20' viewBox='0 0 26 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1266_631)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M9 12L9 13.2857L9 15L2 9L9 3L9 6L15 6L15 3L22 9L15 15L15 13.2857L15 12L9 12Z' fill='black'/%3E%3Cpath d='M9 12L9 11.25L8.25 11.25L8.25 12L9 12ZM9 15L8.51191 15.5694L9.75 16.6307L9.75 15L9 15ZM2 9L1.51191 8.43056L0.847557 9L1.51191 9.56944L2 9ZM9 3L9.75 3L9.75 1.36933L8.51191 2.43056L9 3ZM9 6L8.25 6L8.25 6.75L9 6.75L9 6ZM15 6L15 6.75L15.75 6.75L15.75 6L15 6ZM15 3L15.4881 2.43056L14.25 1.36933L14.25 3L15 3ZM22 9L22.4881 9.56944L23.1524 9L22.4881 8.43056L22 9ZM15 15L14.25 15L14.25 16.6307L15.4881 15.5694L15 15ZM15 12L15.75 12L15.75 11.25L15 11.25L15 12ZM9.75 13.2857L9.75 12L8.25 12L8.25 13.2857L9.75 13.2857ZM9.75 15L9.75 13.2857L8.25 13.2857L8.25 15L9.75 15ZM1.51191 9.56944L8.51191 15.5694L9.48809 14.4306L2.48809 8.43056L1.51191 9.56944ZM8.51191 2.43056L1.51191 8.43056L2.48809 9.56944L9.48809 3.56944L8.51191 2.43056ZM9.75 6L9.75 3L8.25 3L8.25 6L9.75 6ZM9 6.75L15 6.75L15 5.25L9 5.25L9 6.75ZM15.75 6L15.75 3L14.25 3L14.25 6L15.75 6ZM14.5119 3.56944L21.5119 9.56944L22.4881 8.43056L15.4881 2.43056L14.5119 3.56944ZM21.5119 8.43056L14.5119 14.4306L15.4881 15.5694L22.4881 9.56944L21.5119 8.43056ZM15.75 15L15.75 13.2857L14.25 13.2857L14.25 15L15.75 15ZM15.75 13.2857L15.75 12L14.25 12L14.25 13.2857L15.75 13.2857ZM15 11.25L9 11.25L9 12.75L15 12.75L15 11.25Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1266_631' x='0.147656' y='0.669141' width='25.7047' height='18.6617' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1266_631'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1266_631' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_NWSE = `data:image/svg+xml,%3Csvg width='21' height='18' viewBox='0 0 21 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1266_655)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.27119 8.33425L4.43618 9.31192L3.32284 10.6155L1.89669 1.5069L11.1162 1.4906L9.16787 3.77182L13.7303 7.66851L15.6787 5.38729L17.1048 14.4959L7.88528 14.5122L8.99862 13.2086L9.83362 12.2309L5.27119 8.33425Z' fill='black'/%3E%3Cpath d='M5.27119 8.33425L5.75827 7.76395L5.18797 7.27686L4.70088 7.84717L5.27119 8.33425ZM3.32284 10.6155L2.58187 10.7315L2.83411 12.3425L3.89315 11.1026L3.32284 10.6155ZM1.89669 1.5069L1.89536 0.756901L1.02036 0.758448L1.15572 1.62292L1.89669 1.5069ZM11.1162 1.4906L11.6865 1.97769L12.7456 0.737719L11.1149 0.740602L11.1162 1.4906ZM9.16787 3.77182L8.59757 3.28473L8.11048 3.85504L8.68079 4.34212L9.16787 3.77182ZM13.7303 7.66851L13.2432 8.23881L13.8135 8.7259L14.3006 8.15559L13.7303 7.66851ZM15.6787 5.38729L16.4196 5.27127L16.1674 3.66023L15.1083 4.9002L15.6787 5.38729ZM17.1048 14.4959L17.1061 15.2459L17.9811 15.2443L17.8458 14.3798L17.1048 14.4959ZM7.88528 14.5122L7.31497 14.0251L6.25594 15.265L7.8866 15.2622L7.88528 14.5122ZM9.83362 12.2309L10.4039 12.718L10.891 12.1477L10.3207 11.6606L9.83362 12.2309ZM5.00649 9.799L5.84149 8.82134L4.70088 7.84717L3.86588 8.82483L5.00649 9.799ZM3.89315 11.1026L5.00649 9.799L3.86588 8.82483L2.75254 10.1284L3.89315 11.1026ZM1.15572 1.62292L2.58187 10.7315L4.06381 10.4995L2.63766 1.39088L1.15572 1.62292ZM11.1149 0.740602L1.89536 0.756901L1.89801 2.2569L11.1175 2.2406L11.1149 0.740602ZM9.73818 4.2589L11.6865 1.97769L10.5459 1.00351L8.59757 3.28473L9.73818 4.2589ZM8.68079 4.34212L13.2432 8.23881L14.2174 7.0982L9.65496 3.20151L8.68079 4.34212ZM14.3006 8.15559L16.249 5.87437L15.1083 4.9002L13.16 7.18142L14.3006 8.15559ZM14.9377 5.5033L16.3638 14.6119L17.8458 14.3798L16.4196 5.27127L14.9377 5.5033ZM17.1035 13.7459L7.88395 13.7622L7.8866 15.2622L17.1061 15.2459L17.1035 13.7459ZM8.45558 14.9992L9.56892 13.6957L8.42831 12.7215L7.31497 14.0251L8.45558 14.9992ZM9.56892 13.6957L10.4039 12.718L9.26332 11.7439L8.42831 12.7215L9.56892 13.6957ZM10.3207 11.6606L5.75827 7.76395L4.7841 8.90456L9.34653 12.8012L10.3207 11.6606Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1266_655' x='0.320264' y='0.0373046' width='20.3609' height='17.9273' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1266_655'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1266_655' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_NESW = `data:image/svg+xml,%3Csvg width='22' height='18' viewBox='0 0 22 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1266_641)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.333 3.77169L9.49802 2.79402L8.38468 1.49047L17.6042 1.50677L16.1781 10.6153L14.2297 8.33412L9.66727 12.2308L11.6156 14.512L2.39609 14.4957L3.82224 5.38716L4.93558 6.69071L5.77059 7.66838L10.333 3.77169Z' fill='black'/%3E%3Cpath d='M9.49802 2.79402L10.0683 2.30694L9.49802 2.79402ZM10.333 3.77169L10.8201 4.34199L11.3904 3.85491L10.9033 3.2846L10.333 3.77169ZM8.38468 1.49047L8.386 0.740473L6.75534 0.73759L7.81437 1.97756L8.38468 1.49047ZM17.6042 1.50677L18.3452 1.62279L18.4805 0.75832L17.6055 0.756773L17.6042 1.50677ZM16.1781 10.6153L15.6078 11.1024L16.6668 12.3424L16.919 10.7314L16.1781 10.6153ZM14.2297 8.33412L14.8 7.84704L14.3129 7.27673L13.7426 7.76382L14.2297 8.33412ZM9.66727 12.2308L9.18019 11.6605L8.60988 12.1476L9.09697 12.7179L9.66727 12.2308ZM11.6156 14.512L11.6143 15.262L13.245 15.2649L12.1859 14.0249L11.6156 14.512ZM2.39609 14.4957L1.65512 14.3797L1.51977 15.2442L2.39476 15.2457L2.39609 14.4957ZM3.82224 5.38716L4.39255 4.90007L3.33351 3.66011L3.08127 5.27114L3.82224 5.38716ZM4.93558 6.69071L4.36528 7.1778L4.93558 6.69071ZM5.77059 7.66838L5.20028 8.15546L5.68737 8.72577L6.25767 8.23868L5.77059 7.66838ZM8.92771 3.28111L9.76272 4.25878L10.9033 3.2846L10.0683 2.30694L8.92771 3.28111ZM7.81437 1.97756L8.92771 3.28111L10.0683 2.30694L8.95498 1.00339L7.81437 1.97756ZM17.6055 0.756773L8.386 0.740473L8.38335 2.24047L17.6029 2.25677L17.6055 0.756773ZM16.919 10.7314L18.3452 1.62279L16.8632 1.39076L15.4371 10.4993L16.919 10.7314ZM13.6594 8.82121L15.6078 11.1024L16.7484 10.1283L14.8 7.84704L13.6594 8.82121ZM13.7426 7.76382L9.18019 11.6605L10.1544 12.8011L14.7168 8.90443L13.7426 7.76382ZM9.09697 12.7179L11.0453 14.9991L12.1859 14.0249L10.2376 11.7437L9.09697 12.7179ZM11.6169 13.762L2.39742 13.7457L2.39476 15.2457L11.6143 15.262L11.6169 13.762ZM3.13706 14.6117L4.56322 5.50318L3.08127 5.27114L1.65512 14.3797L3.13706 14.6117ZM3.25194 5.87425L4.36528 7.1778L5.50589 6.20363L4.39255 4.90007L3.25194 5.87425ZM4.36528 7.1778L5.20028 8.15546L6.34089 7.18129L5.50589 6.20363L4.36528 7.1778ZM6.25767 8.23868L10.8201 4.34199L9.84594 3.20139L5.2835 7.09807L6.25767 8.23868Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1266_641' x='0.819775' y='0.0373046' width='20.3607' height='17.9273' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1266_641'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1266_641' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;
const CURSOR_NOT_ALLOWED = `data:image/svg+xml,%3Csvg width='27' height='27' viewBox='0 0 27 27' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg filter='url(%23filter0_d_1401_678)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.9359 7.92575C5.03085 9.22209 4.5 10.7991 4.5 12.5C4.5 16.9183 8.08172 20.5 12.5 20.5C14.4218 20.5 16.1853 19.8224 17.5646 18.693L5.9359 7.92575ZM18.6325 17.6376L6.90666 6.78033C8.34908 5.36957 10.323 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5C20.5 14.4558 19.7981 16.2478 18.6325 17.6376ZM12.5 22C17.7467 22 22 17.7467 22 12.5C22 7.25329 17.7467 3 12.5 3C7.25329 3 3 7.25329 3 12.5C3 17.7467 7.25329 22 12.5 22Z' fill='black'/%3E%3C/g%3E%3Cg filter='url(%23filter1_d_1401_678)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6.90666 6.78033C7.26791 6.42701 7.6625 6.10764 8.08526 5.82737C9.35054 4.98855 10.8682 4.5 12.5 4.5C16.9183 4.5 20.5 8.08172 20.5 12.5C20.5 13.9118 20.1343 15.2382 19.4925 16.3896C19.2555 16.8146 18.9809 17.2159 18.6732 17.5887C18.6597 17.6051 18.6461 17.6214 18.6325 17.6376L6.90666 6.78033ZM9.22572 6.88335L18.3519 15.3335C18.7673 14.4775 19 13.5167 19 12.5C19 8.91015 16.0899 6 12.5 6C11.3054 6 10.1873 6.32135 9.22572 6.88335ZM17.5646 18.693C17.1675 19.0182 16.7385 19.3059 16.2831 19.5507C15.1567 20.1564 13.8685 20.5 12.5 20.5C8.08172 20.5 4.5 16.9183 4.5 12.5C4.5 11.3503 4.74251 10.2573 5.17915 9.26932C5.37179 8.83343 5.60222 8.41798 5.86627 8.02712C5.88923 7.99314 5.91244 7.95935 5.9359 7.92575L17.5646 18.693ZM15.1032 18.4582L6.35934 10.3621C6.1265 11.031 6 11.7501 6 12.5C6 16.0899 8.91015 19 12.5 19C13.4265 19 14.3065 18.8068 15.1032 18.4582ZM18.6741 19.7204C18.6288 19.7592 18.583 19.7976 18.5369 19.8356C16.9722 21.1248 14.9878 21.9231 12.8195 21.9947C12.7134 21.9982 12.6069 22 12.5 22C7.25329 22 3 17.7467 3 12.5C3 12.4885 3.00002 12.4771 3.00006 12.4656C3.00723 10.441 3.64773 8.56565 4.73377 7.02729C4.76429 6.98406 4.79516 6.9411 4.82637 6.8984C5.12246 6.49349 5.44981 6.1129 5.80488 5.76017C5.82166 5.7435 5.8385 5.72689 5.8554 5.71035C7.5618 4.04017 9.89524 3.00808 12.4697 3.00005C12.4798 3.00002 12.4899 3 12.5 3C17.7467 3 22 7.25329 22 12.5C22 12.6088 21.9982 12.7172 21.9945 12.8251C21.9204 15.0302 21.0948 17.0447 19.7657 18.6208C19.7552 18.6331 19.7448 18.6455 19.7343 18.6578C19.4093 19.0392 19.0548 19.3946 18.6741 19.7204ZM23.5 12.5C23.5 18.5751 18.5751 23.5 12.5 23.5C6.42487 23.5 1.5 18.5751 1.5 12.5C1.5 6.42487 6.42487 1.5 12.5 1.5C18.5751 1.5 23.5 6.42487 23.5 12.5Z' fill='white'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_1401_678' x='2.3' y='2.3' width='22.4' height='22.4' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1401_678'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1401_678' result='shape'/%3E%3C/filter%3E%3Cfilter id='filter1_d_1401_678' x='0.8' y='0.8' width='25.4' height='25.4' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dx='1' dy='1'/%3E%3CfeGaussianBlur stdDeviation='0.85'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_1401_678'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_1401_678' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E`;

export default {
  name: "Theme Lib",
  description: "Manages theme parsing and handling",
  ver: 1, // Compatible with core v1
  type: "library",
  init: function (l, c) {
    lib = l;
    Core = c;

    return this.data;
  },
  data: {
    THEME_DATA_VERSION,
    // exported functions here
    validateTheme: (theme) => {
      if (theme && theme.startsWith("{")) {
        // assume valid JSON
        try {
          /*ts*/ `
          interface themeData {
            // Version of theme API this theme is compatible with
            version: number;
            // Display name
            name: string;
            // Theme description
            description: string;
            // Color values (currently not supported)
            values: themeValues | null;
            // Override data-theme property if the theme is CSS-only.
            cssThemeDataset?: string;
            // Wallpaper (optional)
            wallpaper: string | null;
          }`;

          const themeData = JSON.parse(theme);

          /* Validating themeData object */
          if (themeData && typeof themeData === "object") {
            // Validate version property
            if (
              themeData.version &&
              typeof themeData.version === "number" &&
              themeData.version === THEME_DATA_VERSION
            ) {
              // Validate name property
              if (
                themeData.name &&
                typeof themeData.name === "string" &&
                themeData.name.trim() !== ""
              ) {
                // Validate description property
                if (
                  themeData.description &&
                  typeof themeData.description === "string" &&
                  themeData.description.trim() !== ""
                ) {
                  // Validate values and cssThemeDataset properties
                  if (
                    (themeData.values === null &&
                      themeData.cssThemeDataset &&
                      typeof themeData.cssThemeDataset === "string" &&
                      themeData.cssThemeDataset.trim() !== "") ||
                    (typeof themeData.values === "object" &&
                      Object.keys(themeData.values).length > 0)
                  ) {
                    // Validate wallpaper property
                    if (
                      themeData.wallpaper === null ||
                      (typeof themeData.wallpaper === "string" &&
                        themeData.wallpaper.trim() !== "")
                    ) {
                      return { success: true, data: themeData };
                    } else {
                      return {
                        success: false,
                        message: "Invalid wallpaper property",
                      };
                    }
                  } else {
                    return {
                      success: false,
                      message:
                        "Invalid values or cssThemeDataset property in theme data",
                    };
                  }
                } else {
                  return {
                    success: false,
                    message: "Invalid description property in theme data",
                  };
                }
              } else {
                return {
                  success: false,
                  message: "Invalid name property in theme data",
                };
              }
            } else {
              return {
                success: false,
                message: "Invalid version property in theme data",
              };
            }
          } else {
            return { success: false, message: "Invalid theme data" };
          }
        } catch (e) {
          // error
          return { success: false, message: "Failed to parse theme" };
        }
      } else return { success: false, message: "Failed to parse theme" };
    },
    setCurrentTheme: async (theme) => {
      const vfs = await lib.loadLibrary("VirtualFS");

      await vfs.importFS();

      try {
        const appearanceConfig = JSON.parse(
          await vfs.readFile("Root/Pluto/config/appearanceConfig.json")
        );
        if (
          typeof appearanceConfig.useThemeWallpaper !== undefined &&
          appearanceConfig.useThemeWallpaper === true
        ) {
          if (theme.wallpaper) {
            // Securely tell the desktop to change wallpaper
            const d = Core.processList.find((p) => p.name === "ui:Desktop");
            if (d !== undefined) {
              d.proc.send({
                type: "setWallpaper",
                data: theme.wallpaper,
              });
            }
          }
        }
      } catch (e) {
        stop(); // idk
      }

      if (theme.cssThemeDataset) {
        document.documentElement.style.cssText = "";
        document.documentElement.dataset.theme = theme.cssThemeDataset;
      } else {
        if (theme.values) {
          for (let value in theme.values) {
            document.documentElement.style.setProperty(
              "--" + value,
              theme.values[value]
            );
          }
        } else {
          document.documentElement.style.cssText = "";
        }
      }

      let fill = "";
      let stroke = "white";
      let cursorInvert = false;

      if (theme.values !== undefined && theme.values !== null) {
        fill = theme.values.primary;
      }

      switch (theme.cssThemeDataset) {
        case "dark":
          fill = "hsl(222, 27%, 20%)";
          break;
        case "red":
          fill = "hsl(0, 81%, 21%)";
          break;
        case "green":
          fill = "hsl(131, 81%, 21%)";
          break;
        case "grey":
          // fill = "#124b31";
          fill = "#151515";
          break;
        case "light":
          fill = "#f3f3f3";
          cursorInvert = true;
          break;
      }

      if (cursorInvert === true) stroke = "black";

      function url(x) {
        return `url("${x}")`;
      }
      function stringify(str) {
        return url(
          str
            .replace("black", encodeURIComponent(fill))
            .replace("white", encodeURIComponent(stroke))
        );
      }

      document.documentElement.style.setProperty(
        "--cursor-default",
        stringify(CURSOR_DEFAULT)
      );
      document.documentElement.style.setProperty(
        "--cursor-pointer",
        stringify(CURSOR_POINTER)
      );
      document.documentElement.style.setProperty(
        "--cursor-text",
        stringify(CURSOR_TEXT)
      );
      document.documentElement.style.setProperty(
        "--cursor-resize-ns",
        stringify(CURSOR_NS)
      );
      document.documentElement.style.setProperty(
        "--cursor-resize-ew",
        stringify(CURSOR_EW)
      );
      document.documentElement.style.setProperty(
        "--cursor-resize-nwse",
        stringify(CURSOR_NWSE)
      );
      document.documentElement.style.setProperty(
        "--cursor-resize-nesw",
        stringify(CURSOR_NESW)
      );
      document.documentElement.style.setProperty(
        "--cursor-not-allowed",
        stringify(CURSOR_NOT_ALLOWED)
      );
    },
    setWallpaper: async (wallpaper) => {
      if (wallpaper) {
        // Securely tell the desktop to change wallpaper
        const d = Core.processList.find((p) => p.name === "ui:Desktop");
        if (d !== undefined) {
          return await d.proc.send({
            type: "setWallpaper",
            data: wallpaper,
          });
        }
      }
    },
  },
};
