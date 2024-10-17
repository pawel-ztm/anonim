import { Spinner } from 'react-bootstrap';

type LoadingSpinnerProps = {
  message?: string;
};

const LoadingSpinner = ({ message }: LoadingSpinnerProps) => {
  return (
    <div
      className="w-100 d-flex justify-content-center align-items-center flex-column"
      style={{ height: '80vh' }}
    >
      <div style={{ position: 'relative' }}>
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="70.000000pt"
          height="70.000000pt"
          viewBox="15 15 200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
            fill="rgb(220,53,69)"
            stroke="none"
          >
            <path
              d="M680 1335 l-235 -235 111 0 112 0 4 -172 c4 -147 8 -181 27 -229 30
-80 89 -142 169 -181 63 -31 72 -33 177 -33 107 0 112 1 174 35 120 65 181
180 181 343 l0 81 -60 -59 -60 -59 -59 58 -59 58 -3 -85 c-4 -74 -7 -89 -28
-111 -52 -56 -141 -52 -185 7 -19 26 -21 42 -21 185 l0 157 238 3 237 2 0 115
0 115 -240 0 -239 0 -3 120 -3 120 -235 -235z"
            />
          </g>
        </svg>
        <Spinner
          animation="border"
          variant="danger"
          style={{
            width: '5rem',
            height: '5rem',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
