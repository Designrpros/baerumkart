// components/Logo.tsx
import Image from "next/image";
import styled from "styled-components";

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = () => {
  return (
    <LogoContainer>
      <Image src="/Logo.png" alt="BærumKart Logo" width={50} height={50} />
    </LogoContainer>
  );
};

export default Logo;