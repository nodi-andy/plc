import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { axiosPrivate } from '../api/axios';
import useRefreshAccessToken from './useRefreshAccessToken';
import { AccessToken } from '../recoil/atom';

const useAxiosPrivate = () => {
  const [accessToken, setAccessToken] = useRecoilState(AccessToken);
  const getNewToken = useRefreshAccessToken();
  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        const newConfig = config;
        if (!config.headers.Authorization && accessToken) {
          newConfig.headers.Authorization = `Bearer ${accessToken}`;
        }
        return newConfig;
      },
      (error) => {
        Promise.reject(error);
      }
    );
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await getNewToken();

          setAccessToken(newAccessToken);

          prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, getNewToken, setAccessToken]);

  return axiosPrivate;
};
export default useAxiosPrivate;
