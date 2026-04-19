import Animated from 'react-native-reanimated';
import { useEffect } from 'react';
/* apologies this is being all done, even though it
wasn't explicity mentioned in the certain assessments (i.e.
revised project proposal, and so on), but our group wanted
to add all of these features, so that it can helpful for
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
