import { AuroraLoader } from './AuroraLoader';
import '../styles/aurora-loader.css';

export const AuroraLoaderShowcase = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px'
    }}>
      <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '40px' }}>
        Aurora Loader - Wave Style
      </h1>
      
      {/* Main loader display */}
      <div style={{
        position: 'relative',
        width: '600px',
        height: '400px',
        border: '2px solid #0ff',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <AuroraLoader />
      </div>

      {/* Description */}
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '10px',
          color: '#0ff'
        }}>
          Wave Effect Aurora Loader
        </h2>
        <h3 style={{ 
          fontSize: '1.2rem', 
          marginBottom: '20px',
          opacity: 0.8
        }}>
          横方向の波動エフェクト
        </h3>
        <p style={{ 
          fontSize: '1rem',
          lineHeight: '1.6',
          opacity: 0.7
        }}>
          美しいグラデーションが左右に流れるように動き、エネルギッシュでダイナミックな印象を与えます。
          5つのレイヤーが異なる速度とタイミングで動くことで、複雑で魅力的なローディングアニメーションを実現しています。
        </p>
      </div>
    </div>
  );
};