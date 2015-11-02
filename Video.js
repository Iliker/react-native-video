const React = require('react-native');
const {
  Component,
  StyleSheet,
  requireNativeComponent,
  PropTypes,
  NativeModules,
} = React;

const VideoResizeMode = require('./VideoResizeMode');

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

class Video extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = { seekTime: 0 };

    this.seek = this.seek.bind(this);
    this._onLoadStart = this._onLoadStart.bind(this);
    this._onLoad = this._onLoad.bind(this);
    this._onError = this._onError.bind(this);
    this._onProgress = this._onProgress.bind(this);
    this._onSeek = this._onSeek.bind(this);
    this._onEnd = this._onEnd.bind(this);
  }

  render() {
    const { seekTime } = this.state;
    const {
      style,
      source,
      ref,
      resizeMode,
    } = this.props;

    let uri = source.uri;
    if (uri && uri.match(/^\//)) {
      uri = 'file://' + uri;
    }

    const isNetwork = !!(uri && uri.match(/^https?:/));
    const isAsset = !!(uri && uri.match(/^(assets-library|file):/));

    let nativeResizeMode;
    if (resizeMode === VideoResizeMode.stretch) {
      nativeResizeMode = NativeModules.VideoManager.ScaleToFill;
    } else if (resizeMode === VideoResizeMode.contain) {
      nativeResizeMode = NativeModules.VideoManager.ScaleAspectFit;
    } else if (resizeMode === VideoResizeMode.cover) {
      nativeResizeMode = NativeModules.VideoManager.ScaleAspectFill;
    } else {
      nativeResizeMode = NativeModules.VideoManager.ScaleNone;
    }

    let nativeProps = Object.assign({}, this.props);
    Object.assign(nativeProps, {
      style: [styles.base, style],
      resizeMode: nativeResizeMode,
      src: {
        uri: uri,
        isNetwork,
        isAsset,
        type: source.type || 'mp4'
      },
      seek: seekTime,
      onVideoLoad: this._onLoad,
      onVideoProgress: this._onProgress,
      onVideoEnd: this._onEnd,
    });

    return <RCTVideo ref={ref} {...nativeProps} />;
  }

  seek(time) {
    this.setState({ seekTime: time });
  }

  _onLoadStart(event) {
    this.props.onLoadStart && this.props.onLoadStart(event.nativeEvent);
  }

  _onLoad(event) {
    this.props.onLoad && this.props.onLoad(event.nativeEvent);
  }

  _onError(event) {
    this.props.onError && this.props.onError(event.nativeEvent);
  }

  _onProgress(event) {
    this.props.onProgress && this.props.onProgress(event.nativeEvent);
  }

  _onSeek(event) {
    this.props.onSeek && this.props.onSeek(event.nativeEvent);
  }

  _onEnd(event) {
    this.props.onEnd && this.props.onEnd(event.nativeEvent);
  }
}

Video.propTypes = {
  /* Native only */
  src: PropTypes.object,
  seek: PropTypes.number,

  /* Wrapper component */
  ref: PropTypes.string,
  source: PropTypes.object,
  resizeMode: PropTypes.string,
  repeat: PropTypes.bool,
  paused: PropTypes.bool,
  muted: PropTypes.bool,
  volume: PropTypes.number,
  rate: PropTypes.number,
  onLoadStart: PropTypes.func,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onEnd: PropTypes.func,

  /* Required by react-native */
  scaleX: React.PropTypes.number,
  scaleY: React.PropTypes.number,
  translateX: React.PropTypes.number,
  translateY: React.PropTypes.number,
  rotation: React.PropTypes.number,
};

var RCTVideo = requireNativeComponent('RCTVideo', Video, {
  nativeOnly: {
    src: true,
    seek: true,
  },
});

module.exports = Video;