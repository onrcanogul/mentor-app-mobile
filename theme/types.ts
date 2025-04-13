export interface ThemeColors {
  primary: string;
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  button: {
    primary: string;
    text: string;
  };
  input: {
    background: string;
    text: string;
    placeholder: string;
    border: string;
  };
  card: {
    background: string;
    border: string;
  };
  statusBar: string;
  tabBar: {
    active: string;
    inactive: string;
    background: string;
  };
  drawer: {
    background: string;
    activeBackground: string;
    text: string;
    activeText: string;
  };
}

export interface Theme {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      accent: string;
      disabled: string;
    };
    button: {
      primary: string;
      secondary: string;
      disabled: string;
      text: string;
    };
    input: {
      background: string;
      border: string;
      text: string;
      placeholder: string;
    };
    card: {
      background: string;
      border: string;
      shadow: {
        color: string;
        offset: {
          width: number;
          height: number;
        };
        opacity: number;
        radius: number;
        elevation: number;
      };
    };
    statusBar: {
      background: string;
      content: string;
    };
    tabBar: {
      background: string;
      active: string;
      inactive: string;
    };
    drawer: {
      background: string;
      text: string;
      border: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}
