package com.bitkoex;

import android.app.Application;

import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.RNTextInputMask.RNTextInputMaskPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.facebook.react.ReactApplication;
import io.sentry.RNSentryPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.github.yamill.orientation.OrientationPackage;
import com.horcrux.svg.SvgPackage;
import com.oblador.keychain.KeychainPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.rnfs.RNFSPackage;
import org.reactnative.camera.RNCameraPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNSentryPackage(),
            new LinearGradientPackage(),
            new RNTextInputMaskPackage(),
            new VectorIconsPackage(),
            new SvgPackage(),
            new ReactNativeRestartPackage(),
            new OrientationPackage(),
            new KeychainPackage(),
            new RNI18nPackage(),
            new RNFSPackage(),
            new RNCameraPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
