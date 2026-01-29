import {
  AssetUnlockedEvent,
  AvatarCreator,
  AvatarCreatorConfig,
  AvatarExportedEvent,
  UserAuthorizedEvent,
  UserSetEvent,
} from "@readyplayerme/react-avatar-creator";

const config: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: "fullbody",
  quickStart: false,
  language: "en",
};

const style = { width: "100%", height: "100vh", border: "none", margin: 0 };

function App() {
  const handleOnUserSet = (event: UserSetEvent) => {
    console.log(`User ID is: ${event.data.id}`);
  };

  const handleOnAvatarExported = (event: AvatarExportedEvent) => {
    console.log(`Avatar URL is: ${event.data.url}`);
  };

  const handleUserAuthorized = (event: UserAuthorizedEvent) => {
    console.log(`User is:`, event.data);
  };

  const handleAssetUnlocked = (event: AssetUnlockedEvent) => {
    console.log(`Asset unlocked is: ${event.data.assetId}`);
  };
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <AvatarCreator
        subdomain="demo"
        config={config}
        style={style}
        onAvatarExported={handleOnAvatarExported}
        onUserAuthorized={handleUserAuthorized}
        onAssetUnlock={handleAssetUnlocked}
        onUserSet={handleOnUserSet}
      />
    </div>
  );
}

export default App;
