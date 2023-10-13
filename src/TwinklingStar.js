import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const TwinklingStar = ({ position, radius }) => {
    const starRef = useRef();
  
    const initialIntensity = useMemo(() => Math.random() * 0.4 + 0.2, []);
    const minIntensity = useMemo(() => Math.random() * 0.1 + 0.1, []);
    const maxIntensity = useMemo(() => 1, []);
    const period = useMemo(() => Math.random() * 20 + 5, []);
  
    const [emissiveIntensity, setEmissiveIntensity] = useState(initialIntensity);
  
    useFrame(({ clock }) => {
      const elapsedTime = clock.getElapsedTime();
      const phase = (elapsedTime % period) / period;
      
      const newIntensity = minIntensity + (maxIntensity - minIntensity) * Math.sin(Math.PI * phase);
      setEmissiveIntensity(newIntensity);
  
      starRef.current.material.emissiveIntensity = newIntensity;
    });
  
    return (
      <mesh position={position} ref={starRef}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color="white" emissive="#ffffff" emissiveIntensity={emissiveIntensity} />
      </mesh>
    );
}
  
export default TwinklingStar;