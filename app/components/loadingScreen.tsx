export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh",
      width: "100%"
    }}>
      <p>{message}</p>
    </div>
  );
}
